# ⚛️ Laboratorio de Trabajo y Energía 2D / 3D

<p align="center">
  <img src="https://skillicons.dev/icons?i=html,css,js,svg" alt="Tecnologías Utilizadas" /><br />
  <b>HTML5 • CSS3 • JavaScript (ES6) • Canvas API • SVG • MathJax</b>
</p>

<p align="center">
  Simulador educativo interactivo de alta precisión matemática diseñado para explorar las leyes de la mecánica clásica, el Teorema del Trabajo y la Energía, y el comportamiento de las fuerzas conservativas y no conservativas mediante visualizaciones dinámicas en <b>2D</b> y <b>3D Isométrico</b>.
</p>

---

## 📖 Tabla de Contenidos

- [🚀 Características](#-características)
- [🧠 Conceptos Físicos Demostrados](#-conceptos-físicos-demostrados)
- [🏗 Escenarios Disponibles](#-escenarios-disponibles)
- [📖 Ejemplo de Funcionamiento](#-ejemplo-de-funcionamiento)
- [🖥 Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [📂 Estructura del Proyecto](#-estructura-del-proyecto)
- [⚙ Instalación](#-instalación)
- [▶ Uso](#-uso)
- [🎯 Objetivos del Proyecto](#-objetivos-del-proyecto)
- [🌟 Apoya el Proyecto](#-apoya-el-proyecto)
- [👨‍💻 Autor](#-autor)
- [📄 Licencia](#-licencia)

---

# 🚀 Características

- ✅ Simulación física precisa basada en ecuaciones reales de Mecánica Clásica.
- ✅ Dos escenarios independientes: Superficie Horizontal y Plano Inclinado configurable.
- ✅ Cambio dinámico en tiempo real entre vista 2D Frontal y 3D Isométrica.
- ✅ Animación física fluida y escalada del movimiento del bloque.
- ✅ Panel HUD de telemetría con cálculos vectoriales e instantáneos.
- ✅ Descomposición automática de fuerzas y equilibrio en los ejes.
- ✅ Cálculo en tiempo real de fricción, energía cinética ($E_c$) y energía potencial ($E_p$).
- ✅ Monitoreo interactivo de trabajo neto, trabajo aplicado y trabajo disipativo de rozamiento.
- ✅ Reglas de medición analógicas y cuadrícula tipo CAD incorporada.
- ✅ Soporte para modo de pantalla completa y diseño 100% interactivo y adaptable (Responsive).
- ✅ Sliders interactivos estilo iOS emparejados con campos editables numéricos de precisión.
- ✅ Renderizado impecable de ecuaciones matemáticas en la interfaz mediante MathJax.

---

# 🧠 Conceptos Físicos Demostrados

Este laboratorio virtual permite visualizar, manipular y comprender de forma matemática los principales temas del capítulo de Trabajo y Energía de Mecánica Clásica.

## ⚖️ Leyes de Newton

- Descomposición vectorial del Peso ($mg$) y Fuerzas Aplicadas ($F$).
- Equilibrio estático y dinámico en los ejes coordenados.
- Acción de la Fuerza Normal ($N$) y Fuerza de Rozamiento ($F_f$).
- Representación intuitiva de diagramas de cuerpo libre.

---

## 💪 Trabajo Mecánico

Cálculo del trabajo realizado por una fuerza constante a lo largo de un desplazamiento:

$$W = F \cdot d \cdot \cos\theta$$

---

## 🔥 Fuerzas No Conservativas

Modelado del rozamiento dinámico o cinético:

$$F_f = \mu N$$

Y la demostración de la pérdida de energía a través de su trabajo negativo:

$$W_f = -F_f d$$

---

## ⚡ Teorema Trabajo-Energía

El simulador demuestra gráficamente en tiempo real que el trabajo neto realizado por todas las fuerzas sobre un cuerpo es equivalente al cambio exacto de su energía cinética:

$$W_{neto} = \Delta E_c$$

---

## 🚀 Energía Cinética

Cuantificación de la energía asociada al estado de movimiento del bloque:

$$E_c = \frac{1}{2}mv^2$$

---

## 🌍 Energía Potencial Gravitatoria

En el escenario del plano inclinado se añade el análisis de la energía de posición respecto a la altura ($h$):

$$E_p = mgh$$

Esto permite al estudiante observar la conservación de la energía mecánica total y la transformación mutua entre $E_p$ y $E_c$.

---

# 🏗 Escenarios Disponibles

## 1️⃣ Superficie Horizontal

Permite aislar y estudiar de forma simplificada variables cinemáticas y dinámicas:
- Trabajo mecánico de fuerzas horizontales y angulares.
- Fuerza de rozamiento uniforme.
- Variación directa de la energía cinética partiendo de diferentes velocidades iniciales.

---

## 2️⃣ Plano Inclinado

Introduce una complejidad física ideal para niveles avanzados:
- Descomposición del peso en sus componentes paralela ($mg\sin\alpha$) y perpendicular ($mg\cos\alpha$).
- Reducción proporcional de la fuerza normal y su impacto directo en la fuerza de fricción.
- Intercambio energético continuo entre la altura ganada/perdida ($E_p$) y el trabajo neto efectuado ($E_c$).

---

# 📖 Ejemplo de Funcionamiento

## Variables de Entrada

| Parámetro | Símbolo | Valor |
| :--- | :---: | ---: |
| Masa | $m$ | 10 kg |
| Fuerza Aplicada | $F$ | 100 N |
| Ángulo de la Fuerza | $\theta$ | 30° |
| Coeficiente de Rozamiento | $\mu$ | 0.20 |
| Distancia del Recorrido | $d$ | 5 m |
| Velocidad Inicial | $v_0$ | 0 m/s |

---

### Paso 1 — Fuerza Normal

$$N = mg - F\sin\theta$$

$$N = (10)(9.81) - (100)(\sin30^\circ)$$

$$N = 48.1\text{ N}$$

---

### Paso 2 — Fuerza de Rozamiento

$$F_f = \mu N$$

$$F_f = 0.20(48.1)$$

$$F_f = 9.62\text{ N}$$

---

### Paso 3 — Trabajo Aplicado

$$W_F = Fd\cos\theta$$

$$W_F = 100(5)(\cos30^\circ)$$

$$W_F = 433.0\text{ J}$$

---

### Paso 4 — Trabajo de Rozamiento

$$W_f = -F_fd$$

$$W_f = -9.62(5)$$

$$W_f = -48.1\text{ J}$$

---

### Paso 5 — Trabajo Neto

$$W_{neto} = W_F + W_f$$

$$W_{neto} = 433.0 - 48.1$$

$$W_{neto} = 384.9\text{ J}$$

---

### Paso 6 — Energía Cinética Final

Como el bloque parte desde el reposo absoluto ($v_0 = 0$), el Teorema del Trabajo y la Energía estipula de forma exacta que:

$$E_{cf} = W_{neto}$$

$$E_{cf} = 384.9\text{ J}$$

El bloque acelera de forma fluida durante los cinco metros del recorrido mientras el HUD y los vectores dinámicos se actualizan cuadro por cuadro.

---

# 🖥 Tecnologías Utilizadas

- **HTML5:** Estructuración semántica de la aplicación y layouts de control.
- **CSS3:** Diseño visual moderno, variables globales, sliders personalizados y animaciones.
- **JavaScript ES6+:** Motor matemático, cálculos vectoriales nativos y lógica del simulador.
- **Canvas API:** Renderizado gráfico de alto rendimiento para escenarios 2D y proyecciones 3D.
- **SVG:** Iconografía escalable sin pérdida de definición.
- **MathJax:** Despliegue estético y dinámico de las fórmulas matemáticas de física.

---

# 📂 Estructura del Proyecto

    laboratorio-trabajo-energia-2d-3d/
    │
    ├── index.html
    ├── style.css
    ├── script.js
    ├── README.md

### 📄 index.html
Define la arquitectura estructural de la interfaz del laboratorio. Carga el panel interactivo lateral, aloja las tarjetas de telemetría (HUD), gestiona los contenedores principales del Canvas y enlaza las librerías necesarias para el renderizado matemático de MathJax.

### 🎨 style.css
Controla toda la estética visual del simulador. Administra las variables de color (paletas oscuras/claras), sombras suavizadas, la adaptabilidad responsiva para tabletas y dispositivos móviles, y las transiciones fluidas de los controles e interruptores estilo iOS.

### ⚙ script.js
Constituye el núcleo algorítmico, físico y matemático de la aplicación. Lee de manera asíncrona los controles del usuario, procesa las variables mediante ecuaciones físicas, proyecta las coordenadas geométricas para la perspectiva isométrica 3D, y redibuja de forma iterativa el Canvas coordinando la animación del bloque y su HUD de resultados.

---

# ⚙ Instalación

1. Clona el repositorio oficial en tu máquina local:
   `git clone https://github.com/manuelMendo/laboratorio-trabajo-energia-2d-3d.git`

2. Accede al directorio del proyecto:
   `cd laboratorio-trabajo-energia-2d-3d`

3. El proyecto se ha desarrollado con tecnologías web nativas, por lo que **no requiere instalación de dependencias externas**. Puedes ejecutarlo de dos maneras:
- Simplemente haz doble clic sobre el archivo `index.html` para abrirlo en cualquier navegador web moderno.
- Utiliza la extensión **Live Server** en tu editor de código de preferencia (como Visual Studio Code) para desplegar un servidor local con recarga en vivo durante tus sesiones de desarrollo.

---

# ▶ Uso

1. **Elegir el escenario:** Selecciona entre la Superficie Horizontal o el Plano Inclinado según el tipo de análisis que desees realizar.
2. **Configurar la masa:** Ajusta los kilogramos del bloque utilizando el control deslizante correspondiente.
3. **Configurar la fuerza:** Define la magnitud de la fuerza aplicada externa que interactuará con el sistema.
4. **Ajustar el ángulo:** Modifica la dirección vectorial de la fuerza aplicada (u orientación del plano, según corresponda).
5. **Configurar el coeficiente de fricción:** Modifica el parámetro $\mu$ para cambiar la aspereza de la superficie.
6. **Configurar la distancia:** Establece los metros totales que durará el recorrido experimental.
7. **Definir velocidad inicial:** Elige si el cuerpo inicia desde el reposo total o con un impulso inicial determinado.
8. **Presionar "Lanzar Bloque":** Ejecuta el motor físico para observar el desplazamiento del objeto a lo largo de la cuadrícula.
9. **Observar la simulación:** Alterna libremente entre las vistas 2D y 3D Isométrica para evaluar el fenómeno desde diferentes perspectivas visuales.
10. **Analizar los resultados:** Estudia las tarjetas de telemetría del HUD donde se desglosan algebraicamente los pasos matemáticos en tiempo real.

---

# 🎯 Objetivos del Proyecto

Este laboratorio digital actúa como una robusta herramienta pedagógica para la enseñanza de la **Física Teórica y Experimental**, buscando:

- Validar empíricamente el Teorema Trabajo-Energía mediante simulación numérica e interactiva.
- Analizar minuciosamente la descomposición espacial de fuerzas conservativas y disipativas.
- Visualizar de forma palpable los efectos del rozamiento y la transferencia de energía mecánica a térmica.
- Facilitar la correcta interpretación y lectura de diagramas de cuerpo libre vectoriales.
- Fomentar la experimentación heurística en estudiantes mediante la manipulación libre de variables físicas críticas.

---

# 🌟 Apoya el Proyecto

Si este laboratorio te resultó de utilidad para tus asignaturas de física, proyectos de ingeniería o labores de docencia académica, considera otorgarle una ⭐ a este repositorio. Tu apoyo ayuda a que este simulador llegue a más estudiantes, investigadores y docentes en todo el mundo.

---

# 👨‍💻 Autor

## Manuel Mendo
*Ingeniero de Software • Diseñador Gráfico*

Proyecto desarrollado con propósitos educativos de código abierto para la enseñanza interactiva y moderna de la Mecánica Clásica en entornos web y plataformas digitales.

- **Perfil de GitHub:** [https://github.com/manuelMendo](https://github.com/manuelMendo)
- **Repositorio del Proyecto:** [https://github.com/manuelMendo/laboratorio-trabajo-energia-2d-3d](https://github.com/manuelMendo/laboratorio-trabajo-energia-2d-3d)

---

# 📄 Licencia

Este proyecto se distribuye exclusivamente con fines educativos, didácticos y académicos. Tienes plena libertad para utilizarlo, modificarlo y adaptarlo dentro de tus metodologías de enseñanza presenciales o virtuales, manteniendo en todo momento los créditos explícitos del autor original.

© 2026 Manuel Mendo. Todos los derechos reservados.
