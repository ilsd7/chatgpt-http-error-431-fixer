# ChatGPT HTTP ERROR 431 Fixer

[English](../README.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [Español](README.es.md)

> **Funcionamiento local** · **Sin acceso a la red** · **Privacidad ante todo**

Una pequeña herramienta que limpia de forma segura las cookies acumuladas de los chats temporales para evitar que HTTP ERROR 431 vuelva a aparecer al usar ChatGPT.

Al usar chats temporales en la versión web de ChatGPT, se crean continuamente cookies `conv_key_*` que caducan al cabo de un mes. Si los utilizas con frecuencia, pueden llegar a acumularse decenas de cookies o más, lo que aumenta el tamaño de las cabeceras de las solicitudes y puede provocar HTTP ERROR 431 (`Request Header Fields Too Large`).

El proyecto elimina únicamente esas cookies acumuladas; no modifica las cookies de inicio de sesión ni ninguna otra cookie de ChatGPT.

<br>

## Descarga e instalación

La [última versión publicada en GitHub](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest) incluye la extensión para Chromium y una copia del userscript para instalarla manualmente. Para el userscript, se recomienda instalarlo desde Greasy Fork, ya que así puede recibir actualizaciones mediante el gestor de userscripts.

La extensión de Chromium cargada sin empaquetar no se actualiza automáticamente, así que instala manualmente cada nueva versión.

### Chromium: extensión del navegador

Usa la extensión si quieres que la limpieza sea automática. Requiere Chromium 119 o posterior.

1. Descarga el ZIP de la extensión desde los archivos de la versión y descomprímelo.
2. Abre `chrome://extensions`.
3. Activa el **Modo de desarrollador**.
4. Selecciona **Cargar descomprimida** y elige la carpeta extraída, o arrastra esa carpeta a la página de extensiones.

Justo después de instalarse, la extensión comprueba si hay alguna pestaña de chat temporal abierta y solo elimina las cookies objetivo si no hay ninguna. Tras una limpieza correcta, vuelve a comprobarlas tres horas después. Si en ese momento hay una pestaña de chat temporal abierta, no elimina nada y comprueba cada 30 minutos hasta que se cierre.

También elimina inmediatamente las cookies objetivo cuando vuelves a iniciar el navegador después de cerrarlo por completo. Al pulsar el botón de la barra de herramientas, la extensión comprueba primero si hay alguna pestaña de chat temporal abierta; si no la hay, elimina inmediatamente las cookies objetivo y muestra en la insignia cuántas ha eliminado. Si hay una pestaña de chat temporal abierta, no elimina nada.

Firefox no puede ejecutar esta extensión porque no admite los service workers en segundo plano de Manifest V3. Utiliza el userscript en su lugar.

---

### Firefox o limpieza manual: userscript

Si usas Firefox o prefieres no instalar la extensión del navegador, puedes utilizar el userscript. El userscript no permite la limpieza automática. La limpieza manual se ejecuta independientemente de que haya una pestaña de chat temporal abierta, así que tenlo en cuenta. En Chromium se recomienda la extensión anterior.

Actualmente, Violentmonkey no se puede utilizar en Chromium porque añade `firstPartyDomain`, una propiedad exclusiva de Firefox, a las solicitudes de la API de cookies de Chromium. Las cookies objetivo son HttpOnly, por lo que es necesario usar Tampermonkey Beta.

1. Instala el gestor de userscripts correspondiente a tu navegador.
   - Firefox: [Violentmonkey](https://violentmonkey.github.io/) o [Tampermonkey Beta](https://www.tampermonkey.net/index.php?browser=firefox)
   - Chromium: [Tampermonkey Beta](https://www.tampermonkey.net/index.php?browser=chrome)
2. En Chromium 138 o posterior, abre los detalles de la extensión del gestor de userscripts y activa **Allow User Scripts**.
3. Abre la [página del script en Greasy Fork](https://greasyfork.org/es/scripts/587874-chatgpt-http-error-431-fixer-manual) y selecciona **Instalar este script**.
4. Confirma la instalación en el gestor de userscripts.

Como alternativa, descarga `chatgpt-http-error-431-fixer.user.js` desde la [última versión publicada en GitHub](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest) e impórtalo en el gestor de userscripts. Esta copia instalada manualmente no se actualiza de forma automática.

Una vez instalado, aparecen estos comandos en el menú del gestor de userscripts:

- **Count conv_key_* cookies**
- **Delete conv_key_* cookies now**

Si usas Violentmonkey en Firefox, activa estas dos opciones:

1. Opción avanzada global: **Allow GM_cookie to access HTTP-only cookies**
2. Opción del script: **Allow access to HTTP-only cookies**

Es un permiso potente. Concédelo únicamente a scripts que hayas revisado y en los que confíes.

<br>

## Cookies que se eliminan

Una cookie solo se elimina si cumple las dos condiciones siguientes:

- Su dominio normalizado es exactamente `chatgpt.com`.
- Su nombre empieza por `conv_key_`.

Las cookies de inicio de sesión y las demás cookies no se eliminan.

<br>

## Privacidad y seguridad

Todo se ejecuta de forma local. No hay analíticas, telemetría, código remoto, bibliotecas externas ni solicitudes de red iniciadas por las herramientas. Los valores de las cookies nunca se guardan, registran, muestran ni envían.

La extensión solo solicita estos permisos:

- `cookies` para encontrar y eliminar las cookies coincidentes de `chatgpt.com`
- `alarms` para programar comprobaciones a las tres horas y reintentos a los 30 minutos
- `storage` para recordar la hora de la última limpieza correcta
- `https://chatgpt.com/*` para limitar el acceso a cookies y pestañas de ChatGPT

No es necesario compilar. Los archivos publicados en GitHub Release y el userscript publicado en Greasy Fork contienen el código fuente del repositorio sin minificar ni transformar, de modo que puedes revisarlo antes de instalarlo. No hay un proceso adicional de verificación de binarios.

Consulta la [Política de seguridad](../SECURITY.md) para informar de vulnerabilidades.

Para cualquier otro problema, comunícalo a través de [GitHub Issues](https://github.com/ilsd7/chatgpt-http-error-431-fixer/issues).

<br>

## Licencia

Se distribuye bajo la [Licencia Apache 2.0](../LICENSE).

<br>

## Notas

Esta herramienta no corrige todas las causas de HTTP ERROR 431. Solo sirve cuando la causa es la acumulación de cookies de los chats temporales.

ChatGPT es una marca de OpenAI. Este es un proyecto personal e independiente.
