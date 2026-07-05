# ⚛️ Laboratorio de Trabajo y Energía 2D / 3D

<p align="center">

Simulador educativo interactivo para el estudio del **Trabajo, Energía y Mecánica Clásica**, desarrollado con tecnologías web modernas. Permite experimentar en tiempo real con fuerzas, fricción, energía cinética y potencial mediante una simulación precisa en **2D** y **3D Isométrico**.

</p>

---

## 📖 Tabla de Contenidos

- [Características](#-características)
- [Conceptos Físicos](#-conceptos-físicos-demostrados)
- [Escenarios](#-escenarios-disponibles)
- [Funcionamiento](#-ejemplo-de-funcionamiento)
- [Tecnologías](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Objetivos](#-objetivos-del-proyecto)
- [Contribuciones](#-contribuciones)
- [Autor](#-autor)
- [Licencia](#-licencia)

---

# 🚀 Características

- ✅ Simulación física basada en ecuaciones reales de Mecánica Clásica.
- ✅ Escenario de superficie horizontal.
- ✅ Escenario de plano inclinado.
- ✅ Vista 2D Frontal.
- ✅ Vista 3D Isométrica.
- ✅ Cambio de escenario en tiempo real.
- ✅ Animación física del bloque.
- ✅ Panel HUD con cálculos instantáneos.
- ✅ Descomposición automática de fuerzas.
- ✅ Cálculo de fricción.
- ✅ Energía cinética.
- ✅ Energía potencial.
- ✅ Trabajo neto.
- ✅ Trabajo de la fuerza aplicada.
- ✅ Trabajo de rozamiento.
- ✅ Reglas de medición.
- ✅ Cuadrícula tipo CAD.
- ✅ Pantalla completa.
- ✅ Interfaz adaptable (Responsive).
- ✅ Sliders interactivos estilo iOS.
- ✅ Campos editables numéricos.
- ✅ Renderizado de ecuaciones mediante MathJax.

---

# 🧠 Conceptos Físicos Demostrados

Este laboratorio permite comprender de forma visual y matemática los siguientes temas:

## ⚖️ Leyes de Newton

- Peso
- Fuerza Normal
- Fuerza Aplicada
- Fuerza de Rozamiento
- Componentes vectoriales
- Diagramas de cuerpo libre

---

## 💪 Trabajo Mecánico

\[
W=F\cdot d\cdot \cos\theta
\]

---

## 🔥 Fuerzas No Conservativas

Rozamiento dinámico

\[
F_f=\mu N
\]

Trabajo de fricción

\[
W_f=-F_fd
\]

---

## ⚡ Teorema Trabajo-Energía

\[
W_{neto}=\Delta E_c
\]

---

## 🚀 Energía Cinética

\[
E_c=\frac12mv^2
\]

---

## 🌍 Energía Potencial Gravitatoria

\[
E_p=mgh
\]

---

# 🏗 Escenarios Disponibles

## 1️⃣ Superficie Horizontal

Permite estudiar:

- Trabajo mecánico
- Rozamiento
- Fuerza aplicada
- Energía cinética
- Trabajo neto

---

## 2️⃣ Plano Inclinado

Permite estudiar además:

- Peso paralelo
- Peso perpendicular
- Normal
- Altura
- Energía potencial
- Conversión entre energías

---

# 📖 Ejemplo de Funcionamiento

### Variables

| Parámetro | Valor |
|-----------|------:|
| Masa | 10 kg |
| Fuerza | 100 N |
| Ángulo | 30° |
| μ | 0.20 |
| Distancia | 5 m |
| Velocidad Inicial | 0 m/s |

---

### Cálculo de la Normal

\[
N=mg-F\sin\theta
\]

Resultado

```
48.1 N
```

---

### Fuerza de Rozamiento

\[
F_f=\mu N
\]

Resultado

```
9.62 N
```

---

### Trabajo Aplicado

\[
W_F=Fd\cos\theta
\]

Resultado

```
433.0 J
```

---

### Trabajo de Rozamiento

\[
W_f=-F_fd
\]

Resultado

```
-48.1 J
```

---

### Trabajo Neto

```
384.9 J
```

---

### Energía Cinética Final

```
384.9 J
```

---

# 🖥 Tecnologías Utilizadas

- HTML5
- CSS3
- JavaScript ES6
- Canvas API
- SVG
- MathJax

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
├── assets/
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
└── screenshots/
```

---

## 📄 index.html

Contiene toda la estructura visual del laboratorio.

Incluye:

- Panel lateral
- Canvas
- HUD
- Controles
- Botones
- Escenarios
- Renderizado MathJax

---

## 🎨 style.css

Gestiona toda la apariencia gráfica.

- Diseño Responsive
- Variables CSS
- Animaciones
- Tarjetas
- Bototnes
- Sliders
- Sombras
- Colores
- Tipografía

---

## ⚙ script.js

Motor matemático y físico.

Responsable de:

- Leer variables
- Resolver ecuaciones
- Dibujar escenarios
- Animar el bloque
- Actualizar HUD
- Calcular fuerzas
- Calcular trabajos
- Calcular energías
- Administrar eventos

---

# ⚙ Instalación

Clona el repositorio.

```bash
git clone https://github.com/manuelMendo/laboratorio-trabajo-energia-2d-3d.git
```

Ingresa al proyecto.

```bash
cd laboratorio-trabajo-energia-2d-3d
```

No requiere dependencias.

Simplemente abre

```
index.html
```

o utiliza **Live Server** en Visual Studio Code.

---

# ▶ Uso

1. Elegir el escenario.
2. Configurar la masa.
3. Configurar la fuerza.
4. Ajustar el ángulo.
5. Configurar el coeficiente de fricción.
6. Configurar la distancia.
7. Definir velocidad inicial.
8. Presionar **Lanzar Bloque**.
9. Observar la simulación.
10. Analizar los resultados del HUD.

---

# 🎯 Objetivos del Proyecto

Este simulador busca facilitar el aprendizaje mediante una representación interactiva de la Mecánica Clásica.

Permite:

- Comprender el Teorema Trabajo-Energía.
- Analizar el comportamiento de las fuerzas.
- Visualizar la acción del rozamiento.
- Interpretar diagramas de cuerpo libre.
- Relacionar energía y movimiento.
- Experimentar modificando parámetros físicos.

---

# 🤝 Contribuciones

Las contribuciones son bienvenidas.

1. Haz un Fork.

2. Crea una rama.

```bash
git checkout -b nueva-funcionalidad
```

3. Realiza tus cambios.

4. Guarda los cambios.

```bash
git commit -m "Nueva funcionalidad"
```

5. Súbelos.

```bash
git push origin nueva-funcionalidad
```

6. Abre un Pull Request.

---

# 🌟 Apoya el Proyecto

Si este laboratorio te resultó útil para aprender Física o para tus clases, considera darle una ⭐ al repositorio.

Esto ayuda a que más estudiantes y docentes puedan encontrar el proyecto.

---

# 👨‍💻 Autor

## Manuel Mendo

Ingeniero de Software • Diseñador Gráfico

GitHub:

**https://github.com/manuelMendo**

Repositorio del proyecto:

**https://github.com/manuelMendo/laboratorio-trabajo-energia-2d-3d**

---

# 📄 Licencia

Este proyecto fue desarrollado con fines educativos y académicos.

Puedes utilizarlo, modificarlo y adaptarlo para fines de enseñanza, manteniendo los créditos correspondientes al autor.

© 2026 Manuel Mendo. Todos los derechos reservados.
