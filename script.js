"use strict";

class PhysicsEngine {
    constructor() {
        this.canvas = document.getElementById('simCanvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.w = this.canvas.width;
        this.h = this.canvas.height;

        this.scenario = 1; // 1: Horizontal, 2: Plano Inclinado
        this.isRunning = false;
        this.lastTime = performance.now();

        // Memoria independiente del ángulo por escenario:
        // el slider es el mismo control físico, pero θ (fuerza, escenario 1)
        // y α (rampa, escenario 2) son conceptos distintos y no deben pisarse
        // entre sí al cambiar de pestaña.
        this._memAngleForce = 0;   // último θ usado en Superficie Horizontal
        this._memAngleRamp = 1;    // último α usado en Plano Inclinado (mínimo físico permitido)

        // Vista / presentación (no afecta la física)
        this.viewMode = '3d';   // '3d' | '2d'
        this.showGrid = false;
        this.showMeasure = true;

        // Parámetros Físicos Iniciales — arranque limpio en cero / valores mínimos
        this.defaultParams = {
            mass: 1,        // kg (mínimo físico permitido por el slider)
            force: 0,       // N
            angle: 0,       // grados (Ángulo de la fuerza en mod1, inclinación de rampa en mod2)
            mu: 0,          // Coeficiente de fricción
            distance: 5,    // metros a recorrer (valor neutro intermedio)
            vi: 0           // velocidad inicial m/s
        };
        this.params = { ...this.defaultParams };

        // Acordeón de la demostración analítica: solo un paso abierto a la vez.
        // Por defecto, únicamente el Paso 1 inicia abierto.
        this.openMathStep = 1;

        // Estado cinemático actual
        this.blockX = 0;       // Metros recorridos actuales
        this.currentV = 0;     // Velocidad instantánea m/s
        this.accumulatedWf = 0;// Trabajo acumulado por fricción
        this.accumulatedWf_applied = 0; // Trabajo acumulado fuerza aplicada

        this._lastHudValues = null;

        // Cámara / presentación (no afecta la física)
        this.cameraOffset = { x: 0, y: 0 };   // desplazamiento de cámara tras reinicio
        this._dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

        this.init();
    }

    init() {
        this.setScenario(1);
        this._setupCanvas();
        requestAnimationFrame((t) => this.mainLoop(t));
    }

    /* ---------------------------------------------------------
       Canvas DPI / fullscreen-aware sizing. The internal pixel
       resolution always matches the displayed CSS size × DPR so
       the simulation auto-scales when entering fullscreen and the
       ground/ruler/block expand to fill the available space.
       Physics calculations are independent of these values.
    --------------------------------------------------------- */
    _setupCanvas() {
        const resize = () => {
            const rect = this.canvas.getBoundingClientRect();
            const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
            this._dpr = dpr;
            const cssW = Math.max(320, Math.round(rect.width));
            const cssH = Math.max(220, Math.round(rect.height));
            const pxW = Math.round(cssW * dpr);
            const pxH = Math.round(cssH * dpr);
            if (this.canvas.width !== pxW || this.canvas.height !== pxH) {
                this.canvas.width = pxW;
                this.canvas.height = pxH;
            }
            this.w = pxW;
            this.h = pxH;
            this._cssW = cssW;
            this._cssH = cssH;
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        const ro = new ResizeObserver(resize);
        ro.observe(this.canvas);
        window.addEventListener('resize', resize);
        resize();
    }

    resetCamera() {
        // Restablece cualquier offset de cámara (presentacional)
        this.cameraOffset = { x: 0, y: 0 };
        if (this.canvas) {
            // fuerza un re-flujo del canvas al tamaño actual del contenedor
            const rect = this.canvas.getBoundingClientRect();
            if (rect.width > 0) {
                this._cssW = Math.round(rect.width);
                this._cssH = Math.round(rect.height);
            }
        }
    }

    setScenario(type) {
        // 1. Guarda el ángulo actual en la memoria del escenario que se abandona
        if (this.scenario === 1) {
            this._memAngleForce = this.params.angle;
        } else {
            this._memAngleRamp = this.params.angle;
        }

        this.scenario = type;

        // 2. Restaura el ángulo recordado del escenario al que se entra
        //    (nunca se reinicia a 0 salvo que sea la primera vez)
        this.params.angle = (type === 1) ? this._memAngleForce : this._memAngleRamp;

        this.resetSim();
        this.renderUI();
    }

    setViewMode(mode) {
        this.viewMode = mode;
        document.getElementById('btn-view-3d').classList.toggle('active', mode === '3d');
        document.getElementById('btn-view-2d').classList.toggle('active', mode === '2d');
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
        document.getElementById('btn-grid').classList.toggle('active', this.showGrid);
    }

    toggleMeasure() {
        this.showMeasure = !this.showMeasure;
        document.getElementById('btn-measure').classList.toggle('active', this.showMeasure);
    }

    resetSim() {
        this.isRunning = false;
        this.blockX = 0;
        this.currentV = this.params.vi;
        this.accumulatedWf = 0;
        this.accumulatedWf_applied = 0;
        this.renderButtons();
        this.calculateStaticPhysics();
    }

    // Restaura TODAS las variables (masa, fuerza, ángulo, μ, distancia, v₀)
    // a sus valores iniciales limpios, actualiza los sliders visualmente
    // y reinicia la simulación desde cero.
    resetVariables() {
        this.params = { ...this.defaultParams };

        // El ángulo recordado por escenario también vuelve a su valor base
        this._memAngleForce = 0;
        this._memAngleRamp = 1;

        this.renderUI();   // reconstruye los sliders con los valores por defecto
        this.resetSim();   // reinicia el estado físico/animación
    }

    togglePlay() {
        this.isRunning = !this.isRunning;
        this.renderButtons();
    }

    /* ---------------------------------------------------------
       Utilidad: pinta el "fill" de un slider tipo iOS via CSS var
    --------------------------------------------------------- */
    _paintSliderFill(input) {
        const min = parseFloat(input.min), max = parseFloat(input.max), val = parseFloat(input.value);
        const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
        input.style.setProperty('--fill', pct + '%');
    }

    /* ---------------------------------------------------------
       Sincroniza el input de texto editable ("badge") con el
       valor actual de this.params[id]. Se usa tanto al mover el
       slider como al terminar de escribir un valor a mano.
    --------------------------------------------------------- */
    _syncFieldFromParam(id) {
        const txt = document.getElementById(`val_${id}`);
        if (!txt) return;
        const value = this.params[id];
        txt.value = value;
        if (txt._sizeInput) txt._sizeInput(txt);
        else txt.style.width = (String(value).length + 1) + 'ch';

        const badge = txt.closest('.val-badge');
        if (badge) {
            badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump');
        }
    }

    renderUI() {
        const container = document.getElementById('sliders-container');

        let angleLabel = this.scenario === 1 ? "Ángulo de Fuerza (θ)" : "Inclinación Rampa (α)";
        let minAngle = this.scenario === 1 ? 0 : 1;
        let maxAngle = this.scenario === 1 ? 80 : 75;

        const icoMass = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5 9 5 9-5z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M12 13v8"></path></svg>`;
        const icoForce = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"></path><path d="M7 7h10v10"></path></svg>`;
        const icoAngle = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"></path><path d="M4 20L15 6"></path><path d="M4 14a6 6 0 0 1 6 6"></path></svg>`;
        const icoMu = `μ`;
        const icoDistance = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="20" height="6" rx="1"></rect><path d="M6 9v3M10 9v3M14 9v3M18 9v3"></path></svg>`;
        const icoVi = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21a9 9 0 1 1 9-9"></path><path d="M12 12l4-4"></path></svg>`;

        // color de acento por slider (usado para --slider-color e --icon-shadow implícitamente vía clase CSS)
        const sliderColor = {
            mass: 'var(--primary)', force: 'var(--accent)', angle: 'var(--pink)',
            mu: 'var(--info)', distance: 'var(--success)', vi: 'var(--secondary)'
        };

        // Unidades y límites/precisión por variable (para validar lo que el usuario escriba)
        const fieldMeta = {
            mass:     { unit: 'kg',  min: 1,        max: 200,      decimals: 0 },
            force:    { unit: 'N',   min: 0,        max: 600,      decimals: 0 },
            angle:    { unit: '°',   min: minAngle, max: maxAngle, decimals: 0 },
            mu:       { unit: '',    min: 0,        max: 1.5,      decimals: 2 },
            distance: { unit: 'm',   min: 1,        max: 100,      decimals: 0 },
            vi:       { unit: 'm/s', min: 0,        max: 30,       decimals: 1 }
        };
        this._fieldMeta = fieldMeta;

        // Genera el badge editable: input de texto + unidad, mismo look que antes
        const editableBadge = (id, value) => {
            const meta = fieldMeta[id];
            return `<span class="val-badge">
                <input type="text" inputmode="decimal" class="val-input" id="val_${id}" value="${value}" autocomplete="off" spellcheck="false">${meta.unit ? `<span class="val-unit">${meta.unit}</span>` : ''}
            </span>`;
        };

        container.innerHTML = `
            <div class="control-group">
                <div class="control-header">
                    <span class="control-label"><span class="control-icon icon-mass">${icoMass}</span>Masa del Cuerpo</span>
                    ${editableBadge('mass', this.params.mass)}
                </div>
                <input type="range" id="inp_mass" style="--slider-color:${sliderColor.mass}" min="1" max="200" step="1" value="${this.params.mass}">
            </div>
            <div class="control-group">
                <div class="control-header">
                    <span class="control-label"><span class="control-icon icon-force">${icoForce}</span>Fuerza Aplicada (F)</span>
                    ${editableBadge('force', this.params.force)}
                </div>
                <input type="range" id="inp_force" style="--slider-color:${sliderColor.force}" min="0" max="600" step="5" value="${this.params.force}">
            </div>
            <div class="control-group">
                <div class="control-header">
                    <span class="control-label"><span class="control-icon icon-angle">${icoAngle}</span>${angleLabel}</span>
                    ${editableBadge('angle', this.params.angle)}
                </div>
                <input type="range" id="inp_angle" style="--slider-color:${sliderColor.angle}" min="${minAngle}" max="${maxAngle}" step="1" value="${this.params.angle}">
            </div>
            <div class="control-group">
                <div class="control-header">
                    <span class="control-label"><span class="control-icon icon-mu">${icoMu}</span>Coef. Fricción Dinámica (μ)</span>
                    ${editableBadge('mu', this.params.mu)}
                </div>
                <input type="range" id="inp_mu" style="--slider-color:${sliderColor.mu}" min="0" max="1.5" step="0.05" value="${this.params.mu}">
            </div>
            <div class="control-group">
                <div class="control-header">
                    <span class="control-label"><span class="control-icon icon-distance">${icoDistance}</span>Distancia del Ensayo</span>
                    ${editableBadge('distance', this.params.distance)}
                </div>
                <input type="range" id="inp_distance" style="--slider-color:${sliderColor.distance}" min="1" max="100" step="1" value="${this.params.distance}">
            </div>
            <div class="control-group">
                <div class="control-header">
                    <span class="control-label"><span class="control-icon icon-vi">${icoVi}</span>Velocidad Inicial (v₀)</span>
                    ${editableBadge('vi', this.params.vi)}
                </div>
                <input type="range" id="inp_vi" style="--slider-color:${sliderColor.vi}" min="0" max="30" step="0.5" value="${this.params.vi}">
            </div>
        `;

        // Ajusta el ancho del input de texto al contenido (auto-size tipo badge)
        const _sizeInput = (inp) => { inp.style.width = (Math.max(1, inp.value.length) + 1) + 'ch'; };

        // --- Sliders (arrastre normal) ---
        container.querySelectorAll('input[type="range"]').forEach(inp => {
            this._paintSliderFill(inp);
            inp.addEventListener('input', (e) => {
                let id = inp.id.replace('inp_', '');
                this.params[id] = parseFloat(e.target.value);
                this._syncFieldFromParam(id);
                this._paintSliderFill(inp);
                if(!this.isRunning) this.resetSim();
            });
        });

        // --- Badges editables: permite escribir el valor exacto con el teclado ---
        container.querySelectorAll('.val-input').forEach(txt => {
            _sizeInput(txt);

            const id = txt.id.replace('val_', '');
            const meta = fieldMeta[id];

            const applyValue = () => {
                let raw = txt.value.replace(',', '.').trim();
                let num = parseFloat(raw);

                if (isNaN(num)) { this._syncFieldFromParam(id); return; }

                // Aplica los mismos límites físicos que tiene el slider
                num = Math.min(meta.max, Math.max(meta.min, num));
                num = parseFloat(num.toFixed(meta.decimals));

                this.params[id] = num;

                const slider = document.getElementById(`inp_${id}`);
                slider.value = num;
                this._paintSliderFill(slider);
                this._syncFieldFromParam(id);

                if (!this.isRunning) this.resetSim();
            };

            txt.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); applyValue(); txt.blur(); }
                if (e.key === 'Escape') { this._syncFieldFromParam(id); txt.blur(); }
            });
            txt.addEventListener('blur', applyValue);
            txt.addEventListener('focus', () => txt.select());
            txt.addEventListener('input', () => _sizeInput(txt));
        });

        const modeLabel = document.getElementById('sim-mode-label');
        if (modeLabel) {
            modeLabel.textContent = this.scenario === 1 ? 'Vista : Superficie Horizontal' : 'Vista : Plano Inclinado';
        }

        this.renderButtons();
    }

    renderButtons() {
        document.getElementById('btn-tab-1').classList.toggle('active', this.scenario === 1);
        document.getElementById('btn-tab-2').classList.toggle('active', this.scenario === 2);

        const icoPlay = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>`;
        const icoPause = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"></rect><rect x="14" y="5" width="4" height="14"></rect></svg>`;
        const icoReset = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 4v5h5"></path></svg>`;

        const cont = document.getElementById('action-buttons');
        cont.innerHTML = `
            <button class="btn btn-primary" onclick="app.togglePlay()">${this.isRunning ? icoPause + " <span class='btn-label'>Pausar Simulación</span>" : icoPlay + " <span class='btn-label'>Lanzar Bloque</span>"}</button>
            <button class="btn btn-secondary" onclick="app.resetVariables()">${icoReset} <span class="btn-label">Reiniciar Variables</span></button>
        `;
    }

    // Cálculos teóricos del experimento (Módulo estático previo a la animación)
    calculateStaticPhysics() {
        const g = 9.81;
        const m = this.params.mass;
        const F = this.params.force;
        const rad = this.params.angle * Math.PI / 180;
        const mu = this.params.mu;
        const d = this.params.distance;

        let N, Ff, netForce, a, h_inicial, h_final;
        let W_applied, W_friction, W_grav, Ec_i, Ec_f, Ep_i, Ep_f;

        Ec_i = 0.5 * m * Math.pow(this.params.vi, 2);

        if (this.scenario === 1) {
            // SUPERFICIE HORIZONTAL
            h_inicial = 0; h_final = 0;
            Ep_i = 0; Ep_f = 0; W_grav = 0;

            N = (m * g) - (F * Math.sin(rad));
            if(N < 0) N = 0; // El cuerpo levita

            Ff = mu * N;
            let F_propulsora = F * Math.cos(rad);

            if(this.currentV === 0 && Math.abs(F_propulsora) <= Ff) {
                netForce = 0; a = 0; Ff = F_propulsora; // Fricción estática se acopla
            } else {
                netForce = F_propulsora - Ff;
                a = netForce / m;
            }

            W_applied = F * Math.cos(rad) * d;
            W_friction = -Ff * d;
        } else {
            // PLANO INCLINADO (Subida de rampa por defecto)
            h_inicial = 0;
            h_final = d * Math.sin(rad);
            Ep_i = 0;
            Ep_f = m * g * h_final;

            N = m * g * Math.cos(rad);
            Ff = mu * N;

            let P_paralelo = m * g * Math.sin(rad);
            netForce = F - P_paralelo - Ff;

            if(this.currentV === 0 && netForce < 0 && F < (P_paralelo + Ff)) {
                netForce = 0; a = 0; // Equilibrio cinético estático
            } else {
                a = netForce / m;
            }

            W_applied = F * d;
            W_friction = -Ff * d;
            W_grav = -P_paralelo * d; // Trabajo realizado por el peso del cuerpo (opuesto al movimiento)
        }

        let W_neto_teorico = W_applied + W_friction + W_grav;
        Ec_f = Math.max(0, Ec_i + W_neto_teorico);

        this.updateHUDOutputs(W_applied, W_friction, W_grav, Ec_i, Ec_f, Ep_i, Ep_f);
        this.updateMathPanel(N, Ff, netForce, a, W_applied, W_friction, W_grav, W_neto_teorico);
        this.updateDidacticExplanation(netForce, a, Ff);
    }

    updateHUDOutputs(Wa, Wf, Wg, Eci, Ecf, Epi, Epf) {
        const hud = document.getElementById('hud-superior');
        const icoTrend = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"></path><path d="M15 7h6v6"></path></svg>`;
        const icoRotate = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 4v5h5"></path></svg>`;
        const icoActivity = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`;
        const icoZap = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 11-14h-7l1-6z"></path></svg>`;
        const waveSvg = `<svg class="hud-wave" viewBox="0 0 78 38" fill="none" preserveAspectRatio="none"><path d="M0 28 C 10 16, 22 32, 32 20 S 54 10, 66 22 S 78 12, 78 12 L 78 38 L 0 38 Z" fill="currentColor" opacity="0.38"></path></svg>`;

        const card = (key, label, val, color, tint, shadow, icon) => `
            <div class="hud-card" style="--hud-color:${color}; --hud-bg:${tint}; --hud-tint:${tint}; --hud-shadow:${shadow}">
                <div class="hud-glass"></div>
                <div class="hud-card-top">
                    <span class="hud-icon">${icon}</span>
                    <span class="hud-status-dot" aria-hidden="true"></span>
                </div>
                <span class="top-label">${label}</span>
                <div class="top-value" id="hud_${key}" style="color:${color}">${val}</div>
                ${waveSvg}
            </div>`;

        let W_neto = Wa + Wf + Wg;
        hud.innerHTML = `
            ${card('wa', "Trabajo Aplicado (W<sub>F</sub>)", Wa.toFixed(1) + " J", "var(--color-p)", "var(--info-light)", "rgba(59,130,246,0.28)", icoTrend)}
            ${card('wf', "Trabajo Fricción (W<sub>f</sub>)", Wf.toFixed(1) + " J", "var(--color-e)", "var(--danger-light)", "rgba(239,68,68,0.28)", icoRotate)}
            ${card('wn', "Trabajo Neto (W<sub>neto</sub>)", W_neto.toFixed(1) + " J", "var(--color-k)", "var(--success-light)", "rgba(34,197,94,0.28)", icoActivity)}
            ${card('ec', "Energía Cinética Final", Ecf.toFixed(1) + " J", "#8b5cf6", "#EDE9FE", "rgba(139,92,246,0.28)", icoZap)}
        `;

        // micro-animación de "bump" cuando cambia un valor
        const newVals = { wa: Wa.toFixed(1), wf: Wf.toFixed(1), wn: W_neto.toFixed(1), ec: Ecf.toFixed(1) };
        if (this._lastHudValues) {
            Object.keys(newVals).forEach(k => {
                if (this._lastHudValues[k] !== newVals[k]) {
                    const el = document.getElementById(`hud_${k}`);
                    if (el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
                }
            });
        }
        this._lastHudValues = newVals;
    }

    /* ---------------------------------------------------------
       Mini-diagramas SVG compactos para la tarjeta lateral
    --------------------------------------------------------- */
    _miniForceDiagram() {
        return `
        <svg viewBox="0 0 120 90" fill="none">
            <rect x="38" y="38" width="44" height="32" rx="6" fill="#FF7A1A" stroke="#E8600A" stroke-width="2"></rect>
            <line x1="60" y1="38" x2="60" y2="10" stroke="#EF4444" stroke-width="3" stroke-linecap="round"></line>
            <polygon points="60,6 55,16 65,16" fill="#EF4444"></polygon>
            <text x="66" y="16" font-size="11" font-weight="700" fill="#1D2333" font-family="Inter, sans-serif">N</text>
            <line x1="60" y1="70" x2="60" y2="84" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"></line>
            <polygon points="60,88 55,78 65,78" fill="#3B82F6"></polygon>
            <text x="66" y="86" font-size="11" font-weight="700" fill="#1D2333" font-family="Inter, sans-serif">P</text>
            <line x1="82" y1="54" x2="104" y2="54" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"></line>
            <polygon points="108,54 98,49 98,59" fill="#3B82F6"></polygon>
            <text x="88" y="46" font-size="11" font-weight="700" fill="#1D2333" font-family="Inter, sans-serif">Ff</text>
        </svg>`;
    }

    _miniWorkDiagram(positive) {
        const color = positive ? '#22C55E' : '#EF4444';
        return `
        <svg viewBox="0 0 120 70" fill="none">
            <line x1="8" y1="55" x2="112" y2="55" stroke="#D9DCEC" stroke-width="2"></line>
            <path d="M12 50 L38 50 L38 20 L84 20 L84 50 L112 50" stroke="${color}" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"></path>
            <circle cx="38" cy="20" r="3.5" fill="${color}"></circle>
            <circle cx="84" cy="20" r="3.5" fill="${color}"></circle>
            <text x="52" y="14" font-size="10" font-weight="700" fill="#1D2333" font-family="Inter, sans-serif">F · d</text>
        </svg>`;
    }

    _miniBalanceDiagram(net) {
        const positive = net >= 0;
        const color = positive ? '#22C55E' : '#EF4444';
        return `
        <svg viewBox="0 0 120 70" fill="none">
            <rect x="10" y="50" width="100" height="6" rx="3" fill="#EEEDF8"></rect>
            <circle cx="60" cy="53" r="17" fill="${color}" opacity="0.15"></circle>
            <path d="M60 53 L60 22" stroke="${color}" stroke-width="3" stroke-linecap="round"></path>
            <polygon points="${positive ? '60,12 54,24 66,24' : '60,64 54,52 66,52'}" fill="${color}"></polygon>
            <text x="30" y="16" font-size="10" font-weight="700" fill="#1D2333" font-family="Inter, sans-serif">Ec</text>
        </svg>`;
    }

updateMathPanel(N, Ff, Fn, a, Wa, Wf, Wg, Wnet) {
        const container = document.getElementById('math-render');
        const mu = this.params.mu;
        const m = this.params.mass;
        const F = this.params.force;
        const d = this.params.distance;
        const rad = this.params.angle * Math.PI / 180;

        const chevron = `<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg>`;
        const icoCheck = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>`;
        const icoWarn = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"></path><path d="M12 17h.01"></path><circle cx="12" cy="12" r="10"></circle></svg>`;
        const icoDiagram = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;
        const chipDot = `<span class="chip-dot"></span>`;
        const chip = (variant, tex) => `<span class="result-chip${variant ? ' ' + variant : ''}">${chipDot}<span class="chip-tex">$${tex}$</span></span>`;

        if (this.scenario === 1) {
            container.innerHTML = `
                <details class="math-step" id="math-step-1" ontoggle="app.onMathStepToggle(this, 1)" ${this.openMathStep === 1 ? "open" : ""}>
                    <summary class="step-summary">
                        <span class="step-badge">1</span>
                        <span class="step-title">Fuerzas de apoyo y rozamiento<span class="step-subtitle">¿Qué fuerzas actúan sobre el bloque?</span></span>
                        ${chevron}
                    </summary>
                    <div class="step-body">
                        <div class="step-left">
                            <p class="step-explanation">
                                El suelo siempre "empuja" de vuelta al bloque para sostenerlo: a esa fuerza la llamamos
                                <strong>Normal (N)</strong>. Si además empujamos el bloque hacia arriba con la fuerza F
                                (con un ángulo θ), lo estamos "aliviando" un poco, así que N se hace más pequeña.
                                Cuanta menos Normal hay, menos <strong>rozamiento (F<sub>f</sub>)</strong> sufre el bloque
                                al deslizarse, porque el rozamiento depende directamente de cuánto se aprieta contra el suelo.
                            </p>
                            <div class="step-formula">
                                $$\\displaystyle \\begin{aligned}
                                    N &= m \\cdot g - F \\cdot \\sin\\,\\theta \\\\
                                    &= ${m} \\cdot 9.81 - ${F} \\cdot \\sin\\,(${this.params.angle}°) \\\\
                                    &= ${N.toFixed(1)} \\;\\text{N}
                                \\end{aligned}$$
                            </div>
                            <div class="step-formula">
                                $$\\displaystyle \\begin{aligned}
                                    |\\vec{F}_f| &= \\mu \\cdot N \\\\
                                    &= ${mu} \\cdot ${N.toFixed(1)} \\\\
                                    &= ${Math.abs(Ff).toFixed(1)} \\;\\text{N}
                                \\end{aligned}$$
                            </div>
                            <div class="step-results">
                                ${chip('', `N = ${N.toFixed(1)}\\,\\text{N}`)}
                                ${chip('danger', `|F_f| = ${Math.abs(Ff).toFixed(1)}\\,\\text{N}`)}
                            </div>
                        </div>
                        <aside class="step-side">
                            <span class="step-side-title">${icoDiagram} Diagrama rápido</span>
                            <div class="step-side-diagram">${this._miniForceDiagram()}</div>
                            <div class="step-side-values">
                                <div class="step-side-value-item">
                                    <span class="vlabel">Masa</span>
                                    <span class="vnum">${m} kg</span>
                                </div>
                                <div class="step-side-value-item">
                                    <span class="vlabel">μ</span>
                                    <span class="vnum">${mu}</span>
                                </div>
                                <div class="step-side-value-item">
                                    <span class="vlabel">θ</span>
                                    <span class="vnum">${this.params.angle}°</span>
                                </div>
                            </div>
                            <p class="step-side-note">
                                <strong>N</strong> sostiene al bloque desde abajo. <strong>F<sub>f</sub></strong> siempre
                                "frena", oponiéndose al movimiento.
                            </p>
                        </aside>
                    </div>
                </details>

                <details class="math-step" id="math-step-2" ontoggle="app.onMathStepToggle(this, 2)" ${this.openMathStep === 2 ? "open" : ""}>
                    <summary class="step-summary">
                        <span class="step-badge">2</span>
                        <span class="step-title">El trabajo de cada fuerza<span class="step-subtitle">¿Cuánta energía entrega o quita cada fuerza?</span></span>
                        ${chevron}
                    </summary>
                    <div class="step-body">
                        <div class="step-left">
                            <p class="step-explanation">
                                En física, <strong>trabajo (W)</strong> significa "energía transferida por una fuerza al mover
                                un objeto una distancia". Aquí hay dos fuerzas trabajando: la <em>fuerza aplicada F</em>, que
                                empuja al bloque y le <strong>entrega energía</strong> (trabajo positivo), y la
                                <em>fricción F<sub>f</sub></em>, que siempre se opone al movimiento y le
                                <strong>quita energía</strong> (trabajo negativo).
                            </p>
                            <div class="step-formula">
                                $$\\displaystyle \\begin{aligned}
                                    W_F &= |\\vec{F}| \\cos\\,\\theta \\cdot d \\\\
                                    &= ${F} \\cdot \\cos\\,(${this.params.angle}°) \\cdot ${d} \\\\
                                    &= ${Wa.toFixed(1)} \\;\\text{J}
                                \\end{aligned}$$
                            </div>
                            <div class="step-formula">
                                $$\\displaystyle \\begin{aligned}
                                    W_f &= -|\\vec{F}_f| \\cdot d \\\\
                                    &= -${Math.abs(Ff).toFixed(1)} \\cdot ${d} \\\\
                                    &= ${Wf.toFixed(1)} \\;\\text{J}
                                \\end{aligned}$$
                            </div>
                            <div class="step-results">
                                ${chip('', `W_F = ${Wa.toFixed(1)}\\,\\text{J}`)}
                                ${chip('danger', `W_f = ${Wf.toFixed(1)}\\,\\text{J}`)}
                            </div>
                        </div>
                        <aside class="step-side">
                            <span class="step-side-title">${icoDiagram} Trabajo acumulado</span>
                            <div class="step-side-diagram">${this._miniWorkDiagram(Wa + Wf >= 0)}</div>
                            <div class="step-side-values">
                                <div class="step-side-value-item">
                                    <span class="vlabel">d</span>
                                    <span class="vnum">${d} m</span>
                                </div>
                                <div class="step-side-value-item">
                                    <span class="vlabel">F</span>
                                    <span class="vnum">${F} N</span>
                                </div>
                            </div>
                            <p class="step-side-note">
                                A más distancia recorrida (<strong>${d} m</strong>), más trabajo hace cada fuerza,
                                sea para bien (F) o para mal (F<sub>f</sub>).
                            </p>
                        </aside>
                    </div>
                </details>

                <details class="math-step" id="math-step-3" ontoggle="app.onMathStepToggle(this, 3)" ${this.openMathStep === 3 ? "open" : ""}>
                    <summary class="step-summary">
                        <span class="step-badge">3</span>
                        <span class="step-title">El balance final<span class="step-subtitle">¿El bloque gana o pierde velocidad?</span></span>
                        ${chevron}
                    </summary>
                    <div class="step-body">
                        <div class="step-left">
                            <p class="step-explanation">
                                Ahora sumamos todos los trabajos para saber quién "gana": si el resultado
                                (<strong>trabajo neto</strong>) es positivo, el bloque acelera y gana energía cinética.
                                Si es negativo, el bloque frena y pierde energía cinética. Esta idea se llama el
                                <strong>Teorema de Trabajo-Energía</strong>: el trabajo neto es exactamente igual al
                                cambio de energía cinética del bloque.
                            </p>
                            <div class="step-formula">
                                $$\\displaystyle \\begin{aligned}
                                    W_{\\text{neto}} &= W_F + W_f \\\\
                                    &= ${Wa.toFixed(1)} + (${Wf.toFixed(1)}) \\\\
                                    &= ${Wnet.toFixed(1)} \\;\\text{J}
                                \\end{aligned}$$
                            </div>
                            <div class="step-formula">
                                $$\\displaystyle \\begin{aligned}
                                    E_{cf} &= E_{ci} + W_{\\text{neto}} \\\\
                                    &= ${(0.5 * m * Math.pow(this.params.vi, 2)).toFixed(1)} + ${Wnet.toFixed(1)} \\\\
                                    &= ${Math.max(0, 0.5 * m * Math.pow(this.params.vi, 2) + Wnet).toFixed(1)} \\;\\text{J}
                                \\end{aligned}$$
                            </div>
                            <div class="step-results">
                                ${chip('success', `W_{\\text{neto}} = ${Wnet.toFixed(1)}\\,\\text{J}`)}
                                ${chip('accent', `E_{cf} = ${Math.max(0, 0.5 * m * Math.pow(this.params.vi, 2) + Wnet).toFixed(1)}\\,\\text{J}`)}
                                ${chip('', `E_{ci} = ${(0.5 * m * Math.pow(this.params.vi, 2)).toFixed(1)}\\,\\text{J}`)}
                            </div>
                        </div>
                        <aside class="step-side">
                            <span class="step-side-title">${icoDiagram} Resultado</span>
                            <div class="step-side-diagram">${this._miniBalanceDiagram(Wnet)}</div>
                            <div class="step-side-values">
                                <div class="step-side-value-item">
                                    <span class="vlabel">E<sub>ci</sub></span>
                                    <span class="vnum">${(0.5 * m * Math.pow(this.params.vi, 2)).toFixed(1)} J</span>
                                </div>
                                <div class="step-side-value-item">
                                    <span class="vlabel">E<sub>cf</sub></span>
                                    <span class="vnum">${Math.max(0, 0.5 * m * Math.pow(this.params.vi, 2) + Wnet).toFixed(1)} J</span>
                                </div>
                                <div class="step-side-value-item">
                                    <span class="vlabel">ΔEc</span>
                                    <span class="vnum">${Wnet.toFixed(1)} J</span>
                                </div>
                            </div>
                            <p class="step-side-note">
                                Trabajo neto <strong>${Wnet >= 0 ? 'positivo → el bloque acelera' : 'negativo → el bloque frena'}</strong>.
                            </p>
                        </aside>
                    </div>
                </details>

                <div class="balance-summary ${Wnet < 0 ? 'negative' : ''}">
                    ${Wnet >= 0 ? icoCheck : icoWarn}
                    <span>En resumen: el trabajo neto es <strong>${Wnet.toFixed(1)} J</strong>, así que la energía
                    cinética del bloque ${Wnet >= 0 ? 'aumenta' : 'disminuye'}.</span>
                </div>
            `;
        } else {
            let P_paralelo = m * 9.81 * Math.sin(rad);
            container.innerHTML = `
                <details class="math-step" id="math-step-1" ontoggle="app.onMathStepToggle(this, 1)" ${this.openMathStep === 1 ? "open" : ""}>
                    <summary class="step-summary">
                        <span class="step-badge">1</span>
                        <span class="step-title">Fuerzas de apoyo y rozamiento<span class="step-subtitle">¿Qué fuerzas actúan sobre el bloque en la rampa?</span></span>
                        ${chevron}
                    </summary>
                    <div class="step-body">
                        <div class="step-left">
                            <p class="step-explanation">
                                En una rampa, el peso del bloque se "reparte" en dos direcciones: una parte lo empuja
                                <strong>hacia abajo, siguiendo la rampa</strong> (la que lo hace deslizar) y otra parte lo
                                empuja <strong>contra la rampa</strong> (esa es la que genera la Normal N). Cuanto más
                                empuja el bloque contra la rampa, más <strong>rozamiento (F<sub>f</sub>)</strong> aparece
                                para frenarlo.
                            </p>
                            <div class="step-formula">
                                $$\\displaystyle \\begin{aligned}
                                    N &= m \\cdot g \\cdot \\cos\\,\\alpha \\\\
                                    &= ${m} \\cdot 9.81 \\cdot \\cos\\,(${this.params.angle}°) \\\\
                                    &= ${N.toFixed(1)} \\;\\text{N}
                                \\end{aligned}$$
                            </div>
                            <div class="step-formula">
                                $$\\displaystyle \\begin{aligned}
                                    |\\vec{F}_f| &= \\mu \\cdot N \\\\
                                    &= ${mu} \\cdot ${N.toFixed(1)} \\\\
                                    &= ${Math.abs(Ff).toFixed(1)} \\;\\text{N}
                                \\end{aligned}$$
                            </div>
                            <div class="step-formula">
                                $$\\displaystyle \\begin{aligned}
                                    P_{\\parallel} &= m \\cdot g \\cdot \\sin\\,\\alpha \\\\
                                    &= ${m} \\cdot 9.81 \\cdot \\sin\\,(${this.params.angle}°) \\\\
                                    &= ${P_paralelo.toFixed(1)} \\;\\text{N}
                                \\end{aligned}$$
                            </div>
                            <div class="step-results">
                                ${chip('', `N = ${N.toFixed(1)}\\,\\text{N}`)}
                                ${chip('danger', `|F_f| = ${Math.abs(Ff).toFixed(1)}\\,\\text{N}`)}
                                ${chip('accent', `P_{\\parallel} = ${P_paralelo.toFixed(1)}\\,\\text{N}`)}
                            </div>
                        </div>
                        <aside class="step-side">
                            <span class="step-side-title">${icoDiagram} Diagrama rápido</span>
                            <div class="step-side-diagram">${this._miniForceDiagram()}</div>
                            <div class="step-side-values">
                                <div class="step-side-value-item">
                                    <span class="vlabel">α</span>
                                    <span class="vnum">${this.params.angle}°</span>
                                </div>
                                <div class="step-side-value-item">
                                    <span class="vlabel">μ</span>
                                    <span class="vnum">${mu}</span>
                                </div>
                                <div class="step-side-value-item">
                                    <span class="vlabel">m</span>
                                    <span class="vnum">${m} kg</span>
                                </div>
                            </div>
                            <p class="step-side-note">
                                <strong>N</strong> sostiene al bloque contra la rampa. <strong>P<sub>∥</sub></strong> es la
                                parte del peso que lo hace deslizar hacia abajo.
                            </p>
                        </aside>
                    </div>
                </details>

                <details class="math-step" id="math-step-2" ontoggle="app.onMathStepToggle(this, 2)" ${this.openMathStep === 2 ? "open" : ""}>
                    <summary class="step-summary">
                        <span class="step-badge">2</span>
                        <span class="step-title">El trabajo de cada fuerza<span class="step-subtitle">¿Cuánta energía entrega o quita cada fuerza?</span></span>
                        ${chevron}
                    </summary>
                    <div class="step-body">
                        <div class="step-left">
                            <p class="step-explanation">
                                En la rampa hay <strong>tres fuerzas</strong> haciendo trabajo al mismo tiempo: la
                                <em>fuerza aplicada F</em> le <strong>entrega energía</strong> al bloque (trabajo positivo);
                                el <em>peso P<sub>∥</sub></em> y la <em>fricción F<sub>f</sub></em> se le oponen y le
                                <strong>quitan energía</strong> (trabajo negativo). Cuanto más lejos se mueve el bloque,
                                más trabajo hace cada una.
                            </p>
                            <div class="step-formula">
                                $$\\displaystyle \\begin{aligned}
                                    W_F &= |\\vec{F}| \\cdot d \\\\
                                    &= ${F} \\cdot ${d} \\\\
                                    &= ${Wa.toFixed(1)} \\;\\text{J}
                                \\end{aligned}$$
                            </div>
                            <div class="step-formula">
                                $$\\displaystyle \\begin{aligned}
                                    W_g &= -P_{\\parallel} \\cdot d \\\\
                                    &= -${P_paralelo.toFixed(1)} \\cdot ${d} \\\\
                                    &= ${Wg.toFixed(1)} \\;\\text{J}
                                \\end{aligned}$$
                            </div>
                            <div class="step-formula">
                                $$\\displaystyle \\begin{aligned}
                                    W_f &= -|\\vec{F}_f| \\cdot d \\\\
                                    &= -${Math.abs(Ff).toFixed(1)} \\cdot ${d} \\\\
                                    &= ${Wf.toFixed(1)} \\;\\text{J}
                                \\end{aligned}$$
                            </div>
                            <div class="step-results">
                                ${chip('', `W_F = ${Wa.toFixed(1)}\\,\\text{J}`)}
                                ${chip('accent', `W_g = ${Wg.toFixed(1)}\\,\\text{J}`)}
                                ${chip('danger', `W_f = ${Wf.toFixed(1)}\\,\\text{J}`)}
                            </div>
                        </div>
                        <aside class="step-side">
                            <span class="step-side-title">${icoDiagram} Trabajo acumulado</span>
                            <div class="step-side-diagram">${this._miniWorkDiagram(Wnet >= 0)}</div>
                            <div class="step-side-values">
                                <div class="step-side-value-item">
                                    <span class="vlabel">d</span>
                                    <span class="vnum">${d} m</span>
                                </div>
                                <div class="step-side-value-item">
                                    <span class="vlabel">h</span>
                                    <span class="vnum">${(d * Math.sin(rad)).toFixed(2)} m</span>
                                </div>
                            </div>
                            <p class="step-side-note">
                                Tres protagonistas: la fuerza que empuja, el peso que frena y el rozamiento que también frena.
                            </p>
                        </aside>
                    </div>
                </details>

                <details class="math-step" id="math-step-3" ontoggle="app.onMathStepToggle(this, 3)" ${this.openMathStep === 3 ? "open" : ""}>
                    <summary class="step-summary">
                        <span class="step-badge">3</span>
                        <span class="step-title">El balance final<span class="step-subtitle">¿El bloque gana o pierde velocidad?</span></span>
                        ${chevron}
                    </summary>
                    <div class="step-body">
                        <div class="step-left">
                            <p class="step-explanation">
                                Sumamos los tres trabajos para ver el resultado final. Si el <strong>trabajo neto</strong>
                                es positivo, el bloque acelera; si es negativo, el bloque frena. Además, al subir la rampa
                                el bloque va ganando <strong>energía potencial</strong> (energía "guardada" por la altura),
                                que corresponde a lo que le "cuesta" al peso frenarlo en el camino.
                            </p>
                            <div class="step-formula">
                                $$\\displaystyle \\begin{aligned}
                                    W_{\\text{neto}} &= W_F + W_g + W_f \\\\
                                    &= ${Wa.toFixed(1)} + ${Wg.toFixed(1)} + ${Wf.toFixed(1)} \\\\
                                    &= ${Wnet.toFixed(1)} \\;\\text{J}
                                \\end{aligned}$$
                            </div>
                            <div class="step-formula">
                                $$\\displaystyle \\begin{aligned}
                                    \\Delta E_p &= m \\cdot g \\cdot \\Delta h \\\\
                                    &= m \\cdot g \\cdot (h_f - h_i) \\\\
                                    &= ${(-Wg).toFixed(1)} \\;\\text{J}
                                \\end{aligned}$$
                            </div>
                            <div class="step-results">
                                ${chip('success', `W_{\\text{neto}} = ${Wnet.toFixed(1)}\\,\\text{J}`)}
                                ${chip('accent', `\\Delta E_p = ${(-Wg).toFixed(1)}\\,\\text{J}`)}
                                ${chip('', `h = ${(d * Math.sin(rad)).toFixed(2)}\\,\\text{m}`)}
                            </div>
                        </div>
                        <aside class="step-side">
                            <span class="step-side-title">${icoDiagram} Resultado</span>
                            <div class="step-side-diagram">${this._miniBalanceDiagram(Wnet)}</div>
                            <div class="step-side-values">
                                <div class="step-side-value-item">
                                    <span class="vlabel">W<sub>neto</sub></span>
                                    <span class="vnum">${Wnet.toFixed(1)} J</span>
                                </div>
                                <div class="step-side-value-item">
                                    <span class="vlabel">ΔEp</span>
                                    <span class="vnum">${(-Wg).toFixed(1)} J</span>
                                </div>
                                <div class="step-side-value-item">
                                    <span class="vlabel">h</span>
                                    <span class="vnum">${(d * Math.sin(rad)).toFixed(2)} m</span>
                                </div>
                            </div>
                            <p class="step-side-note">
                                Subir cuesta energía: parte se "guarda" como altura (E<sub>p</sub>) y parte se pierde por rozamiento.
                            </p>
                        </aside>
                    </div>
                </details>

                <div class="balance-summary ${Wnet < 0 ? 'negative' : ''}">
                    ${Wnet >= 0 ? icoCheck : icoWarn}
                    <span>En resumen: el trabajo neto es <strong>${Wnet.toFixed(1)} J</strong>, así que la energía
                    cinética del bloque ${Wnet >= 0 ? 'aumenta' : 'disminuye'}. La energía potencial ganada por la altura
                    es de <strong>${(-Wg).toFixed(1)} J</strong>.</span>
                </div>
            `;
        }

        if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
            MathJax.typesetPromise([container]).catch((err) => console.log(err));
        } else if (window.MathJax && typeof window.MathJax.typeset === 'function') {
            window.MathJax.typeset([container]);
        }
    }

    /* ---------------------------------------------------------
       ACORDEÓN REAL — Demostración Analítica.
       Solo un <details> puede permanecer abierto a la vez.
       Al abrir uno, cierra automáticamente los demás y recuerda
       cuál quedó abierto para que sobreviva a los futuros
       re-renders de updateMathPanel() (p. ej. al mover un slider).
    --------------------------------------------------------- */
    onMathStepToggle(detailsEl, stepNumber) {
        if (detailsEl.open) {
            this.openMathStep = stepNumber;
            document.querySelectorAll('#math-render .math-step').forEach((el) => {
                if (el !== detailsEl && el.open) el.open = false;
            });
        } else if (this.openMathStep === stepNumber) {
            this.openMathStep = null;
        }
    }

    updateDidacticExplanation(netForce, accel, Ff) {
        const exp = document.getElementById('didactic-explanation');
        if (!exp) return;
        let txt = "";

        if (this.isRunning) {
            txt = `<strong>Estado:</strong> En movimiento... El bloque se está desplazando bajo la influencia del vector de fuerzas. Observa cómo cambia la cinemática lineal en el Canvas superior.`;
        } else {
            if (accel > 0) {
                txt = `<strong>Análisis Teórico:</strong> La fuerza tractora eficaz supera las fuerzas de oposición externas ($\\vec{F}_f$ y la gravedad si aplica). El sistema experimentará una aceleración neta de <strong class="accent-text">${accel.toFixed(2)} m/s²</strong>. Esto causará un aumento neto en la energía cinética debido a un <strong>Trabajo Neto Positivo</strong>.`;
            } else if (this.params.vi > 0 && netForce < 0) {
                txt = `<strong>Análisis Teórico:</strong> Las fuerzas opositoras (fricción/peso) son mayores que la fuerza aplicada. Dado que el bloque posee una velocidad inicial de <strong>${this.params.vi} m/s</strong>, avanzará perdiendo energía gradualmente (desaceleración) transformándola en calor.`;
            } else {
                txt = `<strong>Análisis Teórico (Estado de Reposo Estático):</strong> La fuerza neta es cero. El bloque es incapaz de romper el estado de inercia inmóvil inicial debido a que la fricción mecánica o la componente del peso contrarrestan por completo la acción del motor. El trabajo útil final será <strong>0.00 Joules</strong>.`;
            }
        }
        const icoInsight = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"></path></svg>`;
        exp.innerHTML = `<div class="insight-empty"><span>${icoInsight}</span><span>${txt}</span></div>`;
    }

    mainLoop(timestamp) {
        let dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        if (dt > 0.05) dt = 0.016;

        this.updatePhysicsSimulation(dt);
        this.drawScene();

        requestAnimationFrame((t) => this.mainLoop(t));
    }

    updatePhysicsSimulation(dt) {
        if (!this.isRunning) return;

        const g = 9.81;
        const m = this.params.mass;
        const F = this.params.force;
        const rad = this.params.angle * Math.PI / 180;
        const mu = this.params.mu;

        let N, Ff, netForce;

        if (this.scenario === 1) {
            N = (m * g) - (F * Math.sin(rad));
            if(N < 0) N = 0;
            Ff = mu * N;
            netForce = (F * Math.cos(rad)) - Ff;
        } else {
            N = m * g * Math.cos(rad);
            Ff = mu * N;
            netForce = F - (m * g * Math.sin(rad)) - Ff;
        }

        let accel = netForce / m;
        this.currentV += accel * dt;

        if (this.currentV <= 0 && this.blockX > 0) {
            this.currentV = 0;
            this.isRunning = false;
            this.renderButtons();
            this.calculateStaticPhysics();
            return;
        }

        this.blockX += this.currentV * dt;

        if (this.blockX >= this.params.distance) {
            this.blockX = this.params.distance;
            this.currentV = Math.sqrt(Math.max(0, Math.pow(this.params.vi, 2) + 2 * accel * this.params.distance));
            this.isRunning = false;
            this.renderButtons();
            this.calculateStaticPhysics();
        }
    }

    /* ---------------------------------------------------------
       RENDER — premium engineering stage.
       Uses CSS-pixel coordinates so the scene fills its container
       and automatically scales up in fullscreen (no tiny objects,
       expanded ground & ruler). Physics remain unaffected.
    --------------------------------------------------------- */
    drawScene() {
        const is3D = this.viewMode === '3d';
        const ctx = this.ctx;
        // CSS pixel work-space (auto-scales with the wrapper / fullscreen)
        const W = this._cssW || this.canvas.clientWidth || this.canvas.width;
        const H = this._cssH || this.canvas.clientHeight || this.canvas.height;
        this.w = W; this.h = H;

        // ---- Ambient background ----
        let bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        if (is3D) {
            bgGrad.addColorStop(0, "#fbfaff");
            bgGrad.addColorStop(0.55, "#f4f1fd");
            bgGrad.addColorStop(1, "#ece6fb");
        } else {
            bgGrad.addColorStop(0, "#fcfcfd");
            bgGrad.addColorStop(0.6, "#f6f6f9");
            bgGrad.addColorStop(1, "#eeeef4");
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Soft key-light from above the stage (subtle)
        let glow = ctx.createRadialGradient(W*0.5, H*0.12, 10, W*0.5, H*0.12, Math.max(W, H)*0.55);
        glow.addColorStop(0, "rgba(108,92,231,0.05)");
        glow.addColorStop(1, "rgba(108,92,231,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        // ---- Optional engineering grid (CAD feel) ----
        if (this.showGrid) {
            ctx.strokeStyle = "rgba(108,92,231,0.09)";
            ctx.lineWidth = 1;
            const step = 32;
            for (let x = 0; x <= W; x += step) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
            }
            for (let y = 0; y <= H; y += step) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
            }
            // stronger center axis
            ctx.strokeStyle = "rgba(108,92,231,0.18)"; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(0, H*0.66); ctx.lineTo(W, H*0.66); ctx.stroke();
        }

        // ---- Stage geometry: fill available space, centered ----
        // El "track" ahora se calcula con la distancia REAL configurada por el
        // usuario (puede ser 2 m o 100 m) — ya no hay un valor fijo de 8 m.
        // Además, en el plano inclinado la escala también se ajusta para que
        // la altura de la rampa quepa verticalmente en el escenario, evitando
        // que ángulos grandes "corten" el dibujo por arriba.
        const margin = Math.min(110, W * 0.085);
        let groundY = H * 0.62;
        let trackMeters = Math.max(0.5, this.params.distance);

        const topPadding = 46; // espacio libre requerido sobre el punto más alto
        const availableHeight = Math.max(40, groundY - topPadding);
        const angleRad = this.params.angle * Math.PI / 180;

        let scaleByWidth = (W - margin * 2 - 20) / trackMeters;
        let scaleByHeight = (this.scenario === 2 && angleRad > 0.001)
            ? availableHeight / (trackMeters * Math.sin(angleRad))
            : Infinity;

        let scalePxPerMeter = Math.min(140, scaleByWidth, scaleByHeight);
        if (!isFinite(scalePxPerMeter) || scalePxPerMeter <= 0) scalePxPerMeter = 40;
        scalePxPerMeter = Math.max(2, scalePxPerMeter);

        let trackPx = trackMeters * scalePxPerMeter;
        // center the track horizontally on the stage
        let startXPixels = (W - trackPx) / 2;
        if (startXPixels < 36) startXPixels = 36;

        ctx.font = "bold 13px 'Inter', 'Segoe UI', system-ui, sans-serif";
        ctx.textBaseline = "alphabetic";

        if (this.scenario === 1) {
            this._drawHorizontalStage(groundY, startXPixels, scalePxPerMeter, is3D, trackMeters);
        } else {
            this._drawInclinedStage(groundY, startXPixels, scalePxPerMeter, is3D, trackMeters);
        }
    }

    _roundRectPath(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    _drawPlatform(startX, endX, groundY, is3D) {
        const ctx = this.ctx;
        const thickness = 14;
        const depth = 12;

        if (is3D) {
            // soft contact shadow
            ctx.fillStyle = "rgba(41, 34, 90, 0.05)";
            ctx.fillRect(startX - 10, groundY + thickness, (endX - startX) + 20, 10);

            // top face (isometric slab)
            ctx.fillStyle = "#E4E1FC";
            ctx.beginPath();
            ctx.moveTo(startX, groundY); ctx.lineTo(endX, groundY);
            ctx.lineTo(endX + depth, groundY - depth); ctx.lineTo(startX + depth, groundY - depth);
            ctx.closePath(); ctx.fill();

            // front face
            ctx.fillStyle = "#B2AAFA";
            ctx.fillRect(startX, groundY, endX - startX, thickness);

            // right side face
            ctx.fillStyle = "#877CEB";
            ctx.beginPath();
            ctx.moveTo(endX, groundY); ctx.lineTo(endX + depth, groundY - depth);
            ctx.lineTo(endX + depth, groundY - depth + thickness); ctx.lineTo(endX, groundY + thickness);
            ctx.closePath(); ctx.fill();
        } else {
            ctx.fillStyle = "#B2AAFA";
            ctx.fillRect(startX, groundY, endX - startX, thickness);
        }
    }

    _drawRuler(startX, endX, y, distanceMeters, scalePxPerMeter, is3D, trackMeters) {
        if (!this.showMeasure) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = "#94A3B8"; ctx.lineWidth = 1;
        ctx.font = "600 10px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#64748B"; ctx.textAlign = "center";

        const track = trackMeters || 8;
        // Espaciado de marcas adaptado a la magnitud del recorrido, para que
        // recorridos largos (ej. 60 m) no saturen la regla con 60 etiquetas.
        let step = 1;
        if (track > 10) step = 2;
        if (track > 25) step = 5;
        if (track > 60) step = 10;
        if (track > 150) step = 20;

        for (let m = 0; m <= track + 0.001; m += step) {
            const x = startX + m * scalePxPerMeter;
            ctx.beginPath(); ctx.moveTo(x, y + 18); ctx.lineTo(x, y + 24); ctx.stroke();
            ctx.fillText(Math.round(m) + "m", x, y + 36);
        }
        ctx.textAlign = "left";
        ctx.restore();
    }

    _drawBlock3D(x, y, w, h, is3D) {
        const ctx = this.ctx;
        const depth = 10;

        if (is3D) {
            // right side face
            ctx.fillStyle = "#C1530A";
            ctx.beginPath();
            ctx.moveTo(x + w, y); ctx.lineTo(x + w + depth, y - depth);
            ctx.lineTo(x + w + depth, y + h - depth); ctx.lineTo(x + w, y + h);
            ctx.closePath(); ctx.fill();

            // top face
            ctx.fillStyle = "#FFA352";
            ctx.beginPath();
            ctx.moveTo(x, y); ctx.lineTo(x + depth, y - depth);
            ctx.lineTo(x + w + depth, y - depth); ctx.lineTo(x + w, y);
            ctx.closePath(); ctx.fill();
        }

        // front face
        ctx.fillStyle = "#FF7A1A";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "#D25400"; ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
    }

    _drawVectorArrow(x1, y1, x2, y2, color, label, labelOffsetX, labelOffsetY) {
        const ctx = this.ctx;
        ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 8 * Math.cos(angle - Math.PI/6), y2 - 8 * Math.sin(angle - Math.PI/6));
        ctx.lineTo(x2 - 8 * Math.cos(angle + Math.PI/6), y2 - 8 * Math.sin(angle + Math.PI/6));
        ctx.closePath(); ctx.fill();

        if (label) {
            ctx.save();
            ctx.font = "bold 12px 'Inter', sans-serif";
            ctx.fillStyle = color;
            ctx.fillText(label, x2 + (labelOffsetX || 8), y2 + (labelOffsetY || 4));
            ctx.restore();
        }
    }

    _drawHorizontalStage(groundY, startXPixels, scalePxPerMeter, is3D, trackMeters) {
        const ctx = this.ctx;
        const endXPixels = startXPixels + (trackMeters * scalePxPerMeter);

        this._drawPlatform(startXPixels, endXPixels, groundY, is3D);
        this._drawRuler(startXPixels, endXPixels, groundY, this.blockX, scalePxPerMeter, is3D, trackMeters);

        // distance target marker (dashed guide)
        ctx.save();
        ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(90, 66, 243, 0.5)"; ctx.lineWidth = 1.2;
        let targetX = startXPixels + (this.params.distance * scalePxPerMeter);
        ctx.beginPath(); ctx.moveTo(targetX, groundY); ctx.lineTo(targetX, groundY - 100); ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "#5D45F9";
        ctx.beginPath(); ctx.arc(targetX, groundY - 100, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "800 10px 'Inter', sans-serif"; ctx.textAlign = "center";
        ctx.fillText("d", targetX, groundY - 116);
        ctx.textAlign = "left";

        // ---- block ----
        let boxW = 56; let boxH = 48;
        let currentBoxX = startXPixels + (this.blockX * scalePxPerMeter);
        let currentBoxY = groundY - boxH;
        this._drawBlock3D(currentBoxX, currentBoxY, boxW, boxH, is3D);

        let cx = currentBoxX + boxW/2; let cy = currentBoxY + boxH/2;
        this._drawVectorArrow(cx, cy, cx, cy - 48, "#ef4444", "N", 8, -2);
        this._drawVectorArrow(cx, cy, cx, cy + 48, "#3b82f6", "P", 8, 10);

        if (this.params.force > 0) {
            let fRad = this.params.angle * Math.PI / 180;
            let arrowLen = 24 + (this.params.force * 0.5);
            let fx = cx + arrowLen * Math.cos(-fRad); let fy = cy + arrowLen * Math.sin(-fRad);
            this._drawVectorArrow(cx, cy, fx, fy, "#3b82f6", "F", 8, 2);
        }
    }

    _drawInclinedStage(groundY, startXPixels, scalePxPerMeter, is3D, trackMeters) {
        const ctx = this.ctx;
        let rampaRad = this.params.angle * Math.PI / 180;
        let startRampaX = startXPixels; let startRampaY = groundY;
        let endRampaX = startRampaX + (trackMeters * scalePxPerMeter) * Math.cos(rampaRad);
        let endRampaY = startRampaY - (trackMeters * scalePxPerMeter) * Math.sin(rampaRad);

        // ramp wedge body
        let rampGrad = ctx.createLinearGradient(startRampaX, endRampaY, startRampaX, startRampaY);
        if (is3D) { rampGrad.addColorStop(0, "#c1b2f8"); rampGrad.addColorStop(1, "#EDE9FE"); }
        else      { rampGrad.addColorStop(0, "#EDE9FE"); rampGrad.addColorStop(1, "#DDD3FB"); }
        ctx.fillStyle = rampGrad;
        ctx.beginPath();
        ctx.moveTo(startRampaX, startRampaY); ctx.lineTo(endRampaX, startRampaY); ctx.lineTo(endRampaX, endRampaY);
        ctx.closePath(); ctx.fill();

        // ramp surface stroke
        ctx.strokeStyle = is3D ? "#8B7CF0" : "#b79ef0"; ctx.lineWidth = is3D ? 5 : 3;
        ctx.beginPath(); ctx.moveTo(startRampaX, startRampaY); ctx.lineTo(endRampaX, endRampaY); ctx.stroke();

        // angle of incline (arc + label)
        ctx.strokeStyle = "#6C5CE7"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(startRampaX, startRampaY, 40, 0, -rampaRad, true); ctx.stroke();
        ctx.fillStyle = "#6C5CE7";
        ctx.font = "700 12px 'JetBrains Mono', monospace"; ctx.textAlign = "left";
        ctx.fillText(this.params.angle + "°", startRampaX + 48, startRampaY - 12);

        // height marker (h)
        ctx.save();
        ctx.strokeStyle = "#b79ef0"; ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(endRampaX + 10, startRampaY); ctx.lineTo(endRampaX + 10, endRampaY); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = "#6B7280";
        ctx.font = "600 11px 'JetBrains Mono', monospace";
        let hReal = (this.params.distance * Math.sin(rampaRad)).toFixed(1);
        ctx.fillText(`h = ${hReal} m`, endRampaX + 18, (startRampaY + endRampaY) / 2 + 4);
        ctx.textAlign = "left";

        // block on the ramp
        let boxW = 50; let boxH = 44;
        let currentDistPx = this.blockX * scalePxPerMeter;
        let bx = startRampaX + currentDistPx * Math.cos(rampaRad);
        let by = startRampaY - currentDistPx * Math.sin(rampaRad);

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(-rampaRad);
        this._drawBlock3D(-boxW/2, -boxH, boxW, boxH, is3D);
        this._drawVectorArrow(0, -boxH/2, 0, -boxH/2 - 45, "#ef4444", "N", 8, 0);
        ctx.restore();

        let centerX = bx; let centerY = by - boxH/2;
        this._drawVectorArrow(centerX, centerY, centerX, centerY + 45, "#3b82f6", "P", 8, 0);

        this._drawRuler(startRampaX, startRampaX + trackMeters * scalePxPerMeter, startRampaY, this.blockX, scalePxPerMeter, is3D, trackMeters);
    }
}

window.app = new PhysicsEngine();

// Toggle fullscreen for the simulation hero panel. Immersive mode:
// the canvas auto-resizes, ground/ruler expand and the stage centers
// itself by leveraging the resize observer in PhysicsEngine._setupCanvas.
const fsBtn = document.getElementById('btn-fullscreen');
if (fsBtn) {
    fsBtn.addEventListener('click', () => {
        const wrapper = document.querySelector('.canvas-wrapper');
        if (!wrapper) return;
        if (!document.fullscreenElement) {
            const req = wrapper.requestFullscreen || wrapper.webkitRequestFullscreen;
            if (req) req.call(wrapper).catch(() => {});
        } else {
            (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        }
    });
}
const _fsWrapper = document.querySelector('.canvas-wrapper');
if (_fsWrapper) {
    const _syncFsClass = () => {
        const isFs = document.fullscreenElement === _fsWrapper || document.webkitFullscreenElement === _fsWrapper;
        _fsWrapper.classList.toggle('is-fullscreen', !!isFs);
        // nudge canvas size after the layout settles so the stage fills the screen
        setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 320);
    };
    document.addEventListener('fullscreenchange', _syncFsClass);
    document.addEventListener('webkitfullscreenchange', _syncFsClass);
}
