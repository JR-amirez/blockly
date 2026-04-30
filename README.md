# ProgramacionBloques (STEAM-G)

Juego educativo de programacion por bloques orientado al desarrollo de habilidades matematicas. Construido con **React**, **Ionic**, **Blockly** y **Capacitor** para plataforma Android.

---

## Tabla de contenidos

1. [Requisitos previos](#requisitos-previos)
2. [Instalacion](#instalacion)
3. [Desarrollo local](#desarrollo-local)
4. [Proceso de build](#proceso-de-build)
5. [Archivo de configuracion](#archivo-de-configuracion)
6. [Estructura de ejercicios](#estructura-de-ejercicios)

---

## Requisitos previos

- **Node.js** >= 18
- **npm** >= 9
- **Ionic CLI** (`npm install -g @ionic/cli`)
- **Android SDK** (si se desea compilar el APK final)

---

## Instalacion

```bash
npm install
```

---

## Desarrollo local

Inicia el servidor de desarrollo con recarga en caliente:

```bash
npm run dev
```

---

## Proceso de build

El comando completo de build genera el proyecto Android optimizado y empaquetado en un archivo ZIP:

```bash
npm run build
```

Este comando ejecuta **secuencialmente** las siguientes etapas:

### 1. `build:web` - Compilacion web

```bash
ionic build
```

Compila el proyecto React/TypeScript con Vite. Genera el bundle de produccion minificado en la carpeta `dist/` con tree-shaking, code-splitting y soporte para navegadores legacy.

### 2. `build:android` - Scaffolding Android

```bash
if not exist android (npx cap add android)
```

Crea el proyecto nativo de Android con Capacitor **solo si la carpeta `android/` no existe**. Si ya existe, este paso se omite.

### 3. `build:android:sync` - Sincronizacion de assets

```bash
npx cap copy android
```

Copia los assets web compilados (`dist/`) al proyecto Android en `android/app/src/main/assets/www/`.

### 4. `patch:capacitor` - Parcheo de Gradle

```bash
node scripts/patch-capacitor-gradle.cjs
```

Aplica parches necesarios a la configuracion de Gradle del proyecto Android.

### 5. `clean:assets` - Limpieza de archivos innecesarios

```bash
rimraf android/.gradle android/.idea/* android/app/build android/build ...
```

**Esta es la etapa de optimizacion.** Se eliminan archivos y directorios que no son necesarios para la distribucion del ZIP base, reduciendo significativamente el tamano del paquete:

| Directorio / Archivo | Razon de eliminacion |
|---|---|
| `android/.gradle/` | Cache de Gradle (se regenera al compilar) |
| `android/.idea/*` | Archivos de configuracion de Android Studio |
| `android/app/build/` | Artefactos de compilaciones anteriores |
| `android/build/` | Directorio de build raiz de Gradle |
| `android/capacitor-cordova-android-plugins/build` | Builds de plugins de Capacitor |
| `android/local.properties` | Rutas locales del SDK (especificas de cada maquina) |
| `android/app/src/androidTest/` | Tests de instrumentacion de Android |
| `android/app/src/test/` | Tests unitarios de Android |
| `android/app/src/main/assets/public/config/bloques-config.json` | Configuracion runtime (debe ser creada por el usuario final) |

> La limpieza reduce el peso del proyecto Android de ~60 MB a ~2-3 MB, ya que todos estos archivos se regeneran automaticamente al abrir el proyecto en Android Studio o al compilar con Gradle.

### 6. `zip:android` - Empaquetado final

```bash
powershell Compress-Archive -Path android -DestinationPath android-base.zip -Force
```

Genera el archivo `android-base.zip` listo para distribucion.

---

## Archivo de configuracion

La aplicacion carga opcionalmente un archivo de configuracion en tiempo de ejecucion desde:

```
public/config/bloques-config.json
```

> **Nota:** Este archivo se elimina durante el proceso de build (`clean:assets`), por lo que debe ser creado manualmente antes de compilar el APK final en Android Studio o cuando se desee personalizar la aplicacion.

### Crear el archivo

Crea el archivo `public/config/bloques-config.json` (o `android/app/src/main/assets/public/config/bloques-config.json` si trabajas directamente en el proyecto Android) con la siguiente estructura:

```json
{
  "nombreApp": "STEAM-G",
  "version": "1.0",
  "fecha": "2025-12-02",
  "descripcion": "Juego para el desarrollo de habilidades matematicas",
  "nivel": "basico",
  "plataformas": ["android"]
}
```

### Opciones disponibles

| Propiedad | Tipo | Requerida | Descripcion | Ejemplo |
|---|---|---|---|---|
| `nombreApp` | `string` | No | Nombre que se muestra en la pantalla de inicio y en el encabezado del juego. | `"STEAM-G"` |
| `version` | `string` | No | Version de la actividad. Se muestra en la pantalla de informacion. | `"1.0"` |
| `autor` | `string` | No | Nombre del autor o docente que configuro la actividad. | `"Valeria C. Z."` |
| `fecha` | `string` | No | Fecha de creacion en formato ISO (`YYYY-MM-DD`). Se formatea automaticamente a texto largo (ej: "2 de diciembre del 2025"). | `"2025-12-02"` |
| `descripcion` | `string` | No | Descripcion breve de la actividad. Se muestra en la pantalla de informacion y en el popover del juego. | `"Juego para el desarrollo de habilidades matematicas"` |
| `nivel` | `string` | No | Nivel de dificultad con el que inicia el juego. Valores aceptados: `"basico"`, `"intermedio"`, `"avanzado"` (tambien acepta los equivalentes en ingles: `"basic"`, `"intermediate"`, `"advanced"`). Por defecto: `"basico"`. | `"intermedio"` |
| `plataformas` | `string[]` | No | Lista de plataformas objetivo. Valores posibles: `"android"`, `"ios"`, `"web"`. Se muestra en la pantalla de informacion. | `["android", "web"]` |

> **Todas las propiedades son opcionales.** Si el archivo no existe o una propiedad no esta definida, la aplicacion usa valores por defecto.

### Valores por defecto

Cuando no se proporciona el archivo de configuracion o se omite alguna propiedad, se usan estos valores:

| Propiedad | Valor por defecto |
|---|---|
| `nombreApp` | `"STEAM-G"` |
| `version` | `"1.0"` |
| `autor` | `"Valeria C. Z."` |
| `fecha` | `"2 de Diciembre del 2025"` |
| `descripcion` | `"Juego para el desarrollo de habilidades matematicas"` |
| `nivel` | `"basic"` (Basico) |
| `plataformas` | `"android"` |

---

## Estructura de ejercicios

Los ejercicios se definen en `public/data/exercises.json` y se organizan por niveles de dificultad:

| Nivel | Ejercicios | Tiempo por ejercicio | Puntos por ejercicio |
|---|---|---|---|
| Basico | 3 | 10 minutos | 10 |
| Intermedio | 4 | 15 minutos | 10 |
| Avanzado | 5 | 20 minutos | 10 |

- **Los puntos por ejercicio son fijos** (10 puntos) y estan definidos en el codigo fuente; no se configuran desde `bloques-config.json`.
- **Cada ejercicio tiene una unica pista** que el jugador puede consultar si necesita ayuda.
- Cada ejercicio incluye **3 casos de prueba** que se ejecutan automaticamente al verificar la respuesta del jugador.
- Solo se otorgan puntos cuando **todos los casos de prueba pasan correctamente** (no hay puntuacion parcial).

### Niveles

- **Basico:** Operaciones aritmeticas fundamentales (suma, resta, multiplicacion).
- **Intermedio:** Transformaciones con un parametro (doble, cuadrado, cubo, valor absoluto).
- **Avanzado:** Geometria y operaciones compuestas (areas, perimetros, promedio, potencia).


### Configuracion de Realidad Aumentada (`ar`)

La propiedad `ar` permite configurar experiencias de Realidad Aumentada que se muestran en tres momentos del juego. Cada fase puede activarse de forma independiente y mostrar distintos tipos de contenido en 3D.

#### Fases disponibles

| Fase | Cuando se muestra | Camara activa |
|------|-------------------|---------------|
| `inicio` | Al terminar la cuenta regresiva, antes de comenzar los ejercicios | No |
| `acierto` | Cada vez que el jugador responde correctamente | Si (camara trasera del dispositivo) |
| `fin` | Al completar todos los ejercicios, antes de la pantalla de resultados | No |

#### Estructura

Cada fase comparte el mismo esquema de propiedades:

```json
{
    "ar": {
        "inicio": {
            "activo": true,
            "contenido": {
                "texto": "Preparate para jugar!",
                "imagen": "/data/images/mi-imagen.png",
                "audio": "/data/audios/mi-audio.mp3",
                "video": "/data/videos/mi-video.mp4"
            }
        },
        "acierto": {
            "activo": true,
            "contenido": {
                "texto": "Correcto!",
                "audio": "/data/audios/aplauso.mp3"
            }
        },
        "fin": {
            "activo": true,
            "contenido": {
                "video": "/data/videos/fin.mp4"
            }
        }
    }
}
```

#### Propiedades de cada fase

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `activo` | `boolean` | Activa o desactiva la fase. Si es `false` o esta ausente, la fase se omite por completo |
| `contenido.texto` | `string` | Texto que se renderiza como geometria 3D flotante en la pantalla |
| `contenido.imagen` | `string` | Ruta a una imagen que se muestra rotando en 3D |
| `contenido.audio` | `string` | Ruta a un archivo de audio que se reproduce automaticamente al abrir la fase |
| `contenido.video` | `string` | Ruta a un video que se despliega con efecto de portal 3D |

#### Comportamiento del contenido

- La fase **solo se muestra** si `activo` es `true` **y** al menos un campo de `contenido` tiene un valor no vacio.
- Se pueden combinar multiples tipos en la misma fase (texto + imagen + audio + video simultaneamente).
- Si se proporciona unicamente `audio` (sin contenido visual), se renderiza un reproductor de audio visible. Si existe contenido visual ademas del audio, el audio se reproduce en segundo plano de forma invisible.
- Las rutas de los archivos de `contenido` son relativas a la carpeta `public/` del proyecto (por ejemplo, `/data/images/foto.png` corresponde a `public/data/images/foto.png`).
- En la fase `acierto` se activa automaticamente la **camara trasera** del dispositivo como fondo.

#### Notas

- La propiedad `ar` completa es **opcional**. Si no se incluye, el juego funciona normalmente sin mostrar ninguna experiencia de RA.
- Cada fase (`inicio`, `acierto`, `fin`) es tambien independientemente opcional.