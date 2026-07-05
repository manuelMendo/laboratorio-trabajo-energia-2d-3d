<p align="center">
  <img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=220&text=⚛️%20Laboratorio%20Físico%202D/3D&fontAlign=50&fontAlignY=40&color=0:00D9FF,100:7F00FF&fontColor=ffffff&fontSize=42&animation=twinkling"/>
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&weight=600&size=24&duration=3000&pause=1000&color=00D9FF&center=true&vCenter=true&width=900&lines=Trabajo+y+Energ%C3%ADa+2D+/+3D;Entorno+Did%C3%A1ctico+Interactivo;Demostraci%C3%B3n+Anal%C3%ADtica+TeX;Dashboard+de+Telemetr%C3%ADa+Live"/>
</p>

<p align="center">

<img src="https://img.shields.io/badge/F%C3%ADsica-Simulaci%C3%B3n-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/JavaScript-ES6-yellow?style=for-the-badge&logo=javascript" />
<img src="https://img.shields.io/badge/HTML5-Canvas-orange?style=for-the-badge&logo=html5" />
<img src="https://img.shields.io/badge/CSS3-Responsivo-blue?style=for-the-badge&logo=css3" />
<img src="https://img.shields.io/badge/Licencia-MIT-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/Estado-Activo-success?style=for-the-badge" />

</p>

---

# ⚛️ Laboratorio de Trabajo y Energía 2D / 3D

Simulador educativo interactivo de alta precisión matemática diseñado para explorar las leyes de la mecánica clásica, el teorema del trabajo-energía cinética y el comportamiento de las fuerzas no conservativas en tiempo real.

---

# 🚀 Características

- **Doble Escenario Físico:** Lógica independiente y exacta para experimentos en Superficie Horizontal y Plano Inclinado con rampas configurables.
- **Presentación Isométrica Dual:** Alternación fluida entre vista en 3D Isométrico para visualización espacial y 2D Frontal para diagramas de vectores puros.
- **Panel de Telemetría (Live HUD):** Bloques interactivos de KPIs que calculan y muestran al instante el Trabajo Aplicado ($W_F$), Trabajo de Fricción ($W_f$), Trabajo Neto ($W_{\text{neto}}$) y Energía Cinética Final ($E_{cf}$).
- **Control de Variables Milimétrico:** Manipulación interactiva vía sliders estilo iOS y campos editables de texto para masa, fuerza, ángulos, distancias, velocidad inicial y coeficiente de rozamiento ($\mu$).
- **Herramientas de Ingeniería:** Inclusión de cuadrícula CAD de guía, reglas adaptativas de medición física según la escala y soporte para pantalla completa inmersiva.

---

# 🧠 Conceptos Físicos Demostrados

El simulador funciona como una potente herramienta pedagógica para ilustrar:

- **Leyes de Newton:** Descomposición de fuerzas en ejes cartesianos, cálculo analítico de la fuerza Normal ($N$) y el Peso paralelo ($P_{\parallel}$).
- **Teorema del Trabajo y la Energía:** Demostración empírica de cómo la suma de trabajos externos modifica la energía cinética total del bloque ($\Delta E_c = W_{\text{neto}}$).
- **Fuerzas No Conservativas:** Disipación de energía mecánica por medio del coeficiente de rozamiento dinámico ($F_f = \mu \cdot N$).
- **Energía Potencial Gravitatoria:** Intercambio y balance energético debido al cambio de altura ($h$) en planos inclinados.

---

# 📖 Ejemplo de Funcionamiento Práctico

Para entender cómo opera el motor matemático del simulador, veamos qué ocurre cuando configuramos el sistema con los siguientes valores en la **Pestaña 1 (Superficie Horizontal)**:

### 1. Variables de Entrada Introducidas:
- **Masa del Cuerpo ($m$):** $10\text{ kg}$
- **Fuerza Aplicada ($F$):** $100\text{ N}$
- **Ángulo de Fuerza ($\theta$):** $30^\circ$
- **Coeficiente de Fricción ($\mu$):** $0.20$
- **Distancia del Ensayo ($d$):** $5\text{ metros}$
- **Velocidad Inicial ($v_0$):** $0\text{ m/s}$ (Reposo)

### 2. Cálculos que realiza el Motor en Tiempo Real:
Al presionar **"Lanzar Bloque"**, el archivo `script.js` procesa los vectores de la siguiente manera:
- **Cálculo de la Normal ($N$):** La fuerza tira hacia arriba aliviando el peso:  
  $$N = m \cdot g - F \cdot \sin\theta = (10 \cdot 9.81) - (100 \cdot \sin 30^\circ) = 98.1 - 50 = \mathbf{48.1\text{ N}}$$
- **Fuerza de Rozamiento ($F_f$):**  
  $$F_f = \mu \cdot N = 0.20 \cdot 48.1 = \mathbf{9.62\text{ N}}$$
- **Trabajo de la Fuerza Aplicada ($W_F$):** Energía inyectada al sistema:  
  $$W_F = F \cdot \cos\theta \cdot d = 100 \cdot \cos 30^\circ \cdot 5 = \mathbf{433.0\text{ Joules}}$$
- **Trabajo de la Fricción ($W_f$):** Energía disipada por calor (siempre negativa):  
  $$W_f = -F_f \cdot d = -9.62 \cdot 5 = \mathbf{-48.1\text{ Joules}}$$

### 3. Resultado Final en el HUD:
- **Trabajo Neto ($W_{\text{neto}}$):** $433.0\text{ J} - 48.1\text{ J} = \mathbf{384.9\text{ Joules}}$ (Energía útil total recibida).
- **Energía Cinética Final ($E_{cf}$):** Como empezó desde cero, la energía final es exactamente igual al trabajo neto recibido: $\mathbf{384.9\text{ Joules}}$. El bloque acelerará visiblemente en el Canvas hasta completar los 5 metros.

---

# 📂 Estructura Detallada del Proyecto

```text
laboratorio-trabajo-energia-2d-3d/
├── index.html     # MÓDULO VISUAL: Define la interfaz de usuario completa. Contiene los layouts
│                  # principales, las tarjetas del HUD de telemetría, el contenedor base para
│                  # el escenario gráfico y la inicialización asíncrona de las ecuaciones MathJax.
│
├── style.css      # MÓDULO DE ESTILOS: Estructuración visual moderna de la aplicación. Controla
│                  # los Design Tokens (colores, sombras, fuentes), las animaciones dinámicas de
│                  # sliders y botones, el modo responsivo adaptativo y el escalado de pantalla completa.
│
├── script.js      # MÓDULO LÓGICO: Motor físico de la aplicación. Captura los valores de los
│                  # controles en vivo, calcula analíticamente las ecuaciones de vectores, coordina
│                  # el bucle de animación lineal e imprime los gráficos dinámicos en el Canvas.
│
└── README.md      # Documentación técnica en español del laboratorio virtual.
