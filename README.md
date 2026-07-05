Aquí tienes todo el archivo `README.md` completo, unificado, corregido y optimizado. Se han corregido todas las ecuaciones matemáticas al formato estándar de bloques de LaTeX (`$$...$$`) para que se rendericen perfectamente en GitHub, y se ha enriquecido la sección de aplicaciones educativas enfocándola directamente en el estudio de la física, el trabajo y la energía.

---

```markdown
# ⚛️ Laboratorio de Trabajo y Energía 2D / 3D

Simulador educativo interactivo de alta precisión matemática diseñado para explorar las leyes de la mecánica clásica, el Teorema del Trabajo y la Energía, y el comportamiento de las fuerzas conservativas y no conservativas mediante visualizaciones dinámicas en 2D y 3D.

---

## 🚀 Características

*   🎯 Simulación precisa basada en ecuaciones reales de Física.
*   🧱 Dos escenarios independientes:
    *   Superficie Horizontal.
    *   Plano Inclinado configurable.
*   🖥️ Cambio entre vista 2D Frontal y 3D Isométrica.
*   📊 HUD de telemetría en tiempo real.
*   🎛️ Controles interactivos mediante sliders y campos numéricos.
*   📐 Reglas de medición y cuadrícula tipo CAD.
*   📈 Cálculo instantáneo de todas las variables físicas.
*   ⚡ Animaciones fluidas del movimiento del bloque.
*   📱 Diseño responsive compatible con computadoras y dispositivos móviles.
*   🧮 Renderizado de ecuaciones matemáticas mediante MathJax.

---

# 🧠 Conceptos Físicos Demostrados

Este laboratorio virtual permite visualizar y comprender los principales temas del capítulo de Trabajo y Energía de Mecánica Clásica.

## Leyes de Newton

*   Descomposición de fuerzas.
*   Equilibrio en los ejes.
*   Fuerza Normal.
*   Peso.
*   Componentes paralelas y perpendiculares.

---

## Trabajo Mecánico

Cálculo del trabajo realizado por una fuerza:

$$W = Fd\cos\theta$$

---

## Fuerza de Fricción

Rozamiento dinámico:

$$F_f=\mu N$$

y su trabajo negativo:

$$W_f=-F_fd$$

---

## Teorema del Trabajo y la Energía

El simulador demuestra en tiempo real que el trabajo neto realizado sobre un cuerpo es igual a su cambio en la energía cinética:

$$W_{neto}=\Delta E_c$$

---

## Energía Cinética

$$E_c=\frac{1}{2}mv^2$$

---

## Energía Potencial Gravitatoria

En el plano inclinado también se analiza:

$$E_p=mgh$$

permitiendo observar la transformación e intercambio continuo entre la energía potencial y la energía cinética.

---

# 📖 Ejemplo de Funcionamiento

## Variables de Entrada

| Variable | Valor |
| :--- | ---: |
| Masa ($m$) | 10 kg |
| Fuerza Aplicada ($F$) | 100 N |
| Ángulo ($\theta$) | 30° |
| Distancia ($d$) | 5 m |
| Coeficiente de Rozamiento ($\mu$) | 0.20 |
| Velocidad Inicial ($v_0$) | 0 m/s |

---

## Paso 1 — Fuerza Normal

$$N = mg - F\sin\theta$$

$$N = (10)(9.81) - (100)(\sin30^\circ)$$

$$N = 48.1\text{ N}$$

---

## Paso 2 — Rozamiento

$$F_f = \mu N$$

$$F_f = 0.20(48.1)$$

$$F_f = 9.62\text{ N}$$

---

## Paso 3 — Trabajo Aplicado

$$W_F = Fd\cos\theta$$

$$W_F = 100(5)(\cos30^\circ)$$

$$W_F = 433\text{ J}$$

---

## Paso 4 — Trabajo de Fricción

$$W_f = -F_fd$$

$$W_f = -9.62(5)$$

$$W_f = -48.1\text{ J}$$

---

## Paso 5 — Trabajo Neto

$$W_{neto} = W_F + W_f$$

$$W_{neto} = 433 - 48.1$$

$$W_{neto} = 384.9\text{ J}$$

---

## Paso 6 — Energía Cinética Final

Como el bloque parte desde el reposo ($v_0 = 0$), el Teorema del Trabajo y la Energía estipula que:

$$E_{cf} = W_{neto}$$

$$E_{cf} = 384.9\text{ J}$$

El bloque acelera durante los cinco metros del recorrido mientras el HUD actualiza todos los vectores y cálculos dinámicos en tiempo real.

---

# 🖥️ Tecnologías Utilizadas

*   HTML5
*   CSS3
*   JavaScript (ES6)
*   Canvas API
*   MathJax
*   SVG

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

### index.html

Define toda la interfaz gráfica del laboratorio. Incluye paneles de configuración, HUD de telemetría, canvas de simulación, tarjetas de resultados, controles y la integración para la carga de MathJax.

### style.css

Contiene toda la apariencia del simulador. Gestiona el diseño responsive, el tema visual moderno, animaciones, sliders, tipografías y la correcta visualización de capas y tarjetas de datos.

### script.js

El motor físico del laboratorio. Se encarga de leer las variables, resolver las ecuaciones diferenciales del movimiento en tiempo real, dibujar los escenarios vectoriales (2D/3D), administrar eventos de usuario y actualizar los gráficos del HUD dinámicamente.

---

# ⚙️ Instalación

Clona el repositorio:

```bash
git clone [https://github.com/manuelMendo/laboratorio-trabajo-energia-2d-3d.git](https://github.com/manuelMendo/laboratorio-trabajo-energia-2d-3d.git)

```

Ingresa al proyecto:

```bash
cd laboratorio-trabajo-energia-2d-3d

```

No requiere instalación de dependencias externas. Simplemente abre `index.html` en tu navegador o utiliza una extensión como **Live Server** en tu editor de código para una mejor experiencia de desarrollo.

---

# ▶️ Uso

1. Selecciona el escenario (Superficie Horizontal o Plano Inclinado).
2. Configura la masa del bloque.
3. Ajusta la magnitud y dirección de la fuerza aplicada.
4. Define el coeficiente de fricción del suelo.
5. Establece la distancia total del recorrido y la velocidad inicial.
6. Presiona **Lanzar Bloque**.
7. Observa la animación interactiva en 2D o 3D.
8. Analiza el HUD interactivo y las gráficas de energía resultantes.

---

# 📚 Aplicaciones Educativas

Este laboratorio está diseñado específicamente como una herramienta pedagógica para el estudio profundo de la **Física Teórica y Experimental**, siendo ideal en asignaturas de **Trabajo y Energía** dentro de:

* **Física General y Mecánica Clásica:** Para la validación empírica de sistemas conservativos y no conservativos.
* **Ingenierías (Civil, Mecánica, Industrial, Electrónica, Sistemas):** Como recurso didáctico para comprender diagramas de cuerpo libre complejos y optimización de fuerzas mecánicas.
* **Laboratorios Virtuales (Educación Secundaria y Universitaria):** Permite a los estudiantes interactuar con variables críticas, realizar recolección de datos y calcular la conversión de energía cinética a potencial sin necesidad de hardware costoso.

---

# 🎯 Objetivos

El proyecto busca facilitar el aprendizaje mediante simulaciones interactivas permitiendo:

* Comprender y comprobar el Teorema Trabajo-Energía de forma visual.
* Analizar las fuerzas reales que interactúan sobre un cuerpo en movimiento.
* Visualizar y cuantificar los efectos térmicos y disipativos del rozamiento.
* Interpretar diagramas de cuerpo libre vectoriales en entornos bi y tridimensionales.
* Experimentar libremente con diferentes parámetros físicos observando consecuencias inmediatas.

---

# 🌐 Repositorio Oficial

GitHub: [https://github.com/manuelMendo/laboratorio-trabajo-energia-2d-3d](https://github.com/manuelMendo/laboratorio-trabajo-energia-2d-3d)

---

# 👨‍💻 Autor

## Manuel Mendo

*Ingeniero de Software y Diseñador Gráfico.*

Proyecto desarrollado con fines educativos para la enseñanza interactiva y moderna de la Mecánica Clásica en plataformas web.

GitHub: [https://github.com/manuelMendo](https://github.com/manuelMendo)

---

# 🤝 Contribuciones

Las contribuciones son totalmente bienvenidas. Si deseas mejorar o añadir funcionalidades al simulador:

1. Haz un Fork del repositorio.
2. Crea una nueva rama:
```bash
git checkout -b nueva-funcionalidad

```


3. Realiza tus cambios y confirmalos:
```bash
git commit -m "Agrega nueva funcionalidad"

```


4. Sube la rama a tu repositorio remoto:
```bash
git push origin nueva-funcionalidad

```


5. Abre un Pull Request detallando tus modificaciones.

---

# ⭐ Si este proyecto te fue útil...

No olvides dejar una ⭐ en GitHub. Tu apoyo ayuda a que este simulador llegue a más estudiantes, investigadores y docentes en todo el mundo.

---

# 📄 Licencia

Este proyecto se distribuye exclusivamente con fines educativos, didácticos y académicos. Puedes utilizarlo, modificarlo y adaptarlo libremente conservando los créditos y autoría correspondientes.

© 2026 Manuel Mendo. Todos los derechos reservados.

```

```
