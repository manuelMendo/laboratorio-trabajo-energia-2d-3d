# ⚛️ Laboratorio de Trabajo y Energía 2D / 3D

Simulador educativo interactivo de alta precisión matemática diseñado para explorar las leyes de la mecánica clásica, el Teorema del Trabajo y la Energía, y el comportamiento de las fuerzas conservativas y no conservativas mediante visualizaciones dinámicas en 2D y 3D.

---

## 🚀 Características

- 🎯 Simulación precisa basada en ecuaciones reales de Física.
- 🧱 Dos escenarios independientes:
  - Superficie Horizontal.
  - Plano Inclinado configurable.
- 🖥️ Cambio entre vista 2D Frontal y 3D Isométrica.
- 📊 HUD de telemetría en tiempo real.
- 🎛️ Controles interactivos mediante sliders y campos numéricos.
- 📐 Reglas de medición y cuadrícula tipo CAD.
- 📈 Cálculo instantáneo de todas las variables físicas.
- ⚡ Animaciones fluidas del movimiento del bloque.
- 📱 Diseño responsive compatible con computadoras y dispositivos móviles.
- 🧮 Renderizado de ecuaciones matemáticas mediante MathJax.

---

# 🧠 Conceptos Físicos Demostrados

Este laboratorio virtual permite visualizar y comprender los principales temas del capítulo de Trabajo y Energía de Mecánica Clásica.

## Leyes de Newton

- Descomposición de fuerzas.
- Equilibrio en los ejes.
- Fuerza Normal.
- Peso.
- Componentes paralelas y perpendiculares.

---

## Trabajo Mecánico

Cálculo del trabajo realizado por una fuerza:

\[
W = Fd\cos\theta
\]

---

## Fuerza de Fricción

Rozamiento dinámico:

\[
F_f=\mu N
\]

y su trabajo negativo:

\[
W_f=-F_fd
\]

---

## Teorema del Trabajo y la Energía

El simulador demuestra en tiempo real que:

\[
W_{neto}=\Delta E_c
\]

---

## Energía Cinética

\[
E_c=\frac12mv^2
\]

---

## Energía Potencial Gravitatoria

En el plano inclinado también se analiza:

\[
E_p=mgh
\]

permitiendo observar la transformación entre energía potencial y energía cinética.

---

# 📖 Ejemplo de Funcionamiento

## Variables de Entrada

| Variable | Valor |
|----------|------:|
| Masa | 10 kg |
| Fuerza Aplicada | 100 N |
| Ángulo | 30° |
| Distancia | 5 m |
| Coeficiente de Rozamiento | 0.20 |
| Velocidad Inicial | 0 m/s |

---

## Paso 1 — Fuerza Normal

\[
N=mg-F\sin\theta
\]

\[
N=(10)(9.81)-(100)(\sin30°)
\]

\[
N=48.1N
\]

---

## Paso 2 — Rozamiento

\[
F_f=\mu N
\]

\[
F_f=0.20(48.1)
\]

\[
F_f=9.62N
\]

---

## Paso 3 — Trabajo Aplicado

\[
W_F=Fd\cos\theta
\]

\[
W_F=100(5)(\cos30°)
\]

\[
W_F=433J
\]

---

## Paso 4 — Trabajo de Fricción

\[
W_f=-F_fd
\]

\[
W_f=-9.62(5)
\]

\[
W_f=-48.1J
\]

---

## Paso 5 — Trabajo Neto

\[
W_{neto}=W_F+W_f
\]

\[
W_{neto}=433-48.1
\]

\[
W_{neto}=384.9J
\]

---

## Paso 6 — Energía Cinética Final

Como el bloque parte desde el reposo:

\[
E_{cf}=W_{neto}
\]

\[
E_{cf}=384.9J
\]

El bloque acelera durante los cinco metros del recorrido mientras el HUD actualiza todos los cálculos en tiempo real.

---

# 🖥️ Tecnologías Utilizadas

- HTML5
- CSS3
- JavaScript (ES6)
- Canvas API
- MathJax
- SVG

---

# 📂 Estructura del Proyecto

```text
laboratorio-trabajo-energia-2d-3d/
│
├── index.html
├── style.css
├── script.js
├── README.md
│
└── assets/
    ├── images/
    ├── icons/
    └── fonts/
```

---

## index.html

Define toda la interfaz gráfica del laboratorio.

Incluye:

- Paneles de configuración
- HUD de telemetría
- Canvas de simulación
- Tarjetas de resultados
- Controles
- Carga de MathJax

---

## style.css

Contiene toda la apariencia del simulador.

Gestiona:

- Diseño Responsive
- Tema visual
- Animaciones
- Botones
- Sliders
- Tarjetas
- Layout
- Sombras
- Tipografía

---

## script.js

Motor físico del laboratorio.

Se encarga de:

- Leer variables
- Resolver ecuaciones
- Dibujar el escenario
- Animar el bloque
- Calcular fuerzas
- Calcular energías
- Calcular trabajos
- Actualizar el HUD
- Administrar eventos
- Cambiar entre modo 2D y 3D

---

# ⚙️ Instalación

Clona el repositorio:

```bash
git clone https://github.com/manuelMendo/laboratorio-trabajo-energia-2d-3d.git
```

Ingresa al proyecto:

```bash
cd laboratorio-trabajo-energia-2d-3d
```

No requiere instalación de dependencias.

Simplemente abre:

```text
index.html
```

o utiliza una extensión como **Live Server** para una mejor experiencia durante el desarrollo.

---

# ▶️ Uso

1. Selecciona el escenario.
2. Configura la masa.
3. Ajusta la fuerza aplicada.
4. Define el ángulo.
5. Configura el coeficiente de fricción.
6. Establece la distancia.
7. Define la velocidad inicial.
8. Presiona **Lanzar Bloque**.
9. Observa la animación.
10. Analiza el HUD y los resultados obtenidos.

---

# 📚 Aplicaciones Educativas

Este laboratorio puede utilizarse en cursos de:

- Física General
- Mecánica Clásica
- Ingeniería Civil
- Ingeniería Mecánica
- Ingeniería Industrial
- Ingeniería Electrónica
- Ingeniería de Sistemas
- Educación Secundaria
- Educación Universitaria

---

# 🎯 Objetivos

El proyecto busca facilitar el aprendizaje mediante simulaciones interactivas permitiendo:

- Comprender el Teorema Trabajo-Energía.
- Analizar fuerzas reales.
- Visualizar el efecto del rozamiento.
- Interpretar diagramas de cuerpo libre.
- Relacionar energía y movimiento.
- Experimentar con diferentes parámetros físicos.

---

# 🌐 Repositorio Oficial

GitHub:

**https://github.com/manuelMendo/laboratorio-trabajo-energia-2d-3d**

---

# 👨‍💻 Autor

## Manuel Mendo

Ingeniero de Software y Diseñador Gráfico.

Proyecto desarrollado con fines educativos para la enseñanza interactiva de la Mecánica Clásica utilizando tecnologías web modernas.

GitHub:

https://github.com/manuelMendo

---

# 🤝 Contribuciones

Las contribuciones son bienvenidas.

Si deseas mejorar el simulador:

1. Haz un Fork.
2. Crea una nueva rama.

```bash
git checkout -b nueva-funcionalidad
```

3. Realiza tus cambios.

4. Confirma los cambios.

```bash
git commit -m "Agrega nueva funcionalidad"
```

5. Sube la rama.

```bash
git push origin nueva-funcionalidad
```

6. Abre un Pull Request.

---

# ⭐ Si este proyecto te fue útil...

No olvides dejar una ⭐ en GitHub.

Tu apoyo ayuda a que el proyecto llegue a más estudiantes y docentes.

---

# 📄 Licencia

Este proyecto se distribuye con fines educativos y académicos.

Puedes utilizarlo, modificarlo y adaptarlo libremente conservando los créditos del autor.

© 2026 Manuel Mendo. Todos los derechos reservados.
