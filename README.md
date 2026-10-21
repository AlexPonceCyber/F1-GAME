# F1-GAME — (Android + Windows)

No instalas nada en el PC: GitHub compila las dos apps en la nube y tú solo descargas el resultado.

## Primera vez
1. Crea una cuenta en github.com y un repositorio **privado** (New repository → Private).
2. Sube TODO el contenido de esta carpeta (Add file → Upload files, arrastrando los archivos y carpetas).
   - Si la carpeta oculta `.github` no se sube, crea a mano el archivo `.github/workflows/build.yml`
     (Add file → Create new file) y pega dentro el contenido de `workflow-build.yml`.
3. Pestaña **Actions** → "Build apps" → Run workflow (también se lanza solo cada vez que subes algo).
4. Espera ~10 min. Dentro de la ejecución, abajo, en **Artifacts** descargas:
   - `F1Glory-android` → zip con `app-debug.apk`
   - `F1Glory-windows` → zip con `F1-Glory-Setup.exe`

## Instalar
- **Android:** pasa el APK al móvil y ábrelo (te pedirá permitir "instalar apps desconocidas").
- **Windows:** ejecuta el .exe. Saldrá el aviso de SmartScreen: "Más información" → "Ejecutar de todas formas".

## Cambiar el juego
Todo el juego está en `game/index.html`. Lo editas en tu PC, lo vuelves a subir al repo (reemplaza el archivo)
y vuelve a compilar solo. Instalas la nueva versión ENCIMA de la vieja y **no pierdes las partidas**
(no desinstales antes; la firma es siempre la misma).

## Ojo
- Las partidas se guardan dentro de cada app: la de Windows y la del móvil no se sincronizan.
- Las imágenes y fuentes se bajan de f1-glory.com al compilar; después viven dentro de tu app (funciona sin internet).
- El ranking online no existe en tu copia. Es un juego de otra persona: uso personal, no lo publiques ni lo compartas.
- Mantén el repo privado (incluye la clave con la que se firma tu APK).
- En Android puedes depurar con chrome://inspect (en el PC con Chrome y el móvil conectado por USB).
