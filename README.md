# MagicHub

## Índice
- [Autores del Proyecto](#autores-del-proyecto)
- [Descripción](#descripción)
- [Objetivos del Proyecto](#objetivos-del-proyecto)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Esquema de la base de datos](#esquema-de-la-base-de-datos)
- [Tutorial de Uso](#tutorial-de-uso)
- [URLs de despliegue y descarga](#urls-de-despliegue-y-descarga)
- [Diseño de la Aplicación](#diseño-de-la-aplicación)
- [Presentación (PDF)](#presentación-pdf)
- [Bitácora de Tareas](#bitácora-de-tareas)
- [Bibliografía](#bibliografía)
- [Vídeos](#vídeos)
- [Anteproyecto](#anteproyecto)

---

## Autores del Proyecto

- David Martín García  
- José Noé González Grelaud  

---

## Descripción

MagicHub es una aplicación web multiplataforma diseñada para unir a la comunidad de *Magic: The Gathering*, desde principiantes hasta expertos.

La aplicación ofrece a los usuarios que puedan intercambiar información a través de chats y foros, además de gestionar y mostrar sus mazos construidos. Dispone también de funcionalidades como la autenticación de usuarios, notificaciones en tiempo real y asesoría de una inteligencia artificial.

Se utilizará Ionic para tener una interfaz de usuario optimizada en dispositivos móviles, Material Design 3 en los componentes visuales y una arquitectura MVVM en el proyecto. 

En el servidor se utilizará un sistema de ficheros para almacenar los logs de los últimos 7 días. Cada día cambiará a un fichero diferente y se podrá tener un seguimiento de posibles errores o simplemente consultar diferentes tipos de datos, como por ejemplo qué usuarios se conectaron ese día a la aplicación.

En el cliente se empleará una persistencia de datos para almacenar opciones de configuración de la aplicación y datos del usuario.

---

## Objetivos del Proyecto

1. Crear un ecosistema para jugadores de *Magic: The Gathering* que fomente la colaboración y el aprendizaje.  
2. Facilitar la interacción social mediante chats y foros.  
3. Ofrecer análisis de cartas y recomendaciones mediante IA.  

---

## Tecnologías Utilizadas

- **Frontend:** Angular + Ionic + Capacitor  
- **Backend:** ASP.NET Core  
- **Base de datos:** MySQL

---

## Esquema de la base de datos

### Diagrama Entidad–Relación (ER)

![Diagrama ER](Images/BBDD.png)

---

## Tutorial de Uso

---

## URLs de despliegue y descarga

### Web
[Enlace](https://magic-hub-app.vercel.app/)

### Android (APK)
[Enlace](https://drive.google.com/drive/folders/1mJjBOEZnIKB-zrNw0YdbJ_z0uCPuiiyF?usp=sharing)

---

## Diseño de la Aplicación

### Figma
[Enlace](https://www.figma.com/design/9UIaWhamE4J6e4vrTp9jap/MAGICHUB-MOCKUP?node-id=0-1&t=RVZqIslaLqk6i7ja-1)

---

## Presentación (PDF)

---

## Bitácora de Tareas

### David
- **12/04/2025**: Configuración inicial del proyecto y instalación de dependencias.
- **13/04/2025**: Login y Registro en el servidor.
- **16/04/2025**: Refrescar el token en el servidor.
- **17/04/2025**: Guardar los logs en ficheros en el servidor.
- **20/04/2025**: Crear entidades y conexión WebSocket.
- **23/04/2025**: Actualización del cliente para login, registro, conexión WebSocket y refresco de token.
- **24/04/2025**: Despliegue del servidor.
- **25/04/2025**: Login en funcionamiento.
- **26/04/2025**: Refresco de token y registro en funcionamiento; despliegue del cliente.
- **27/04/2025**: Búsqueda de cartas por nombre funcionando (servidor y cliente).
- **29/04/2025**: Obtener datos de una carta por ID funcionando (servidor y cliente).


### Noe
- **23/04/2025**: Creación del figma y primeros pasos de maquetación
- **24/04/2025**: Vistas de buscador de cartas, detalles de cartas, mazos, crear mazos completadas.
- **25/04/2025**: Resto de vistas terminadas.
- **27/04/2025**: Ajustes esteticos en el inicio, el login y el menu principal.
- **29/04/2025**: Ajustes esteticos en el menu principal y el registro más la creación de los componentes mazos y crear mazos con sus respectivos estilos.
---

## Bibliografía

- [Documentación de Ionic](https://ionicframework.com/docs/components)
- [Documentación de Angular](https://angular.dev/overview)
- [Documentación de Capacitor](https://capacitorjs.com/docs)
- [Documentación de ASP.NET](https://learn.microsoft.com/es-es/aspnet/core/?view=aspnetcore-9.0)
- [Scryfall API – Magic: The Gathering](https://scryfall.com/docs/api)
- [Simple magic Api demo](https://www.youtube.com/watch?v=l50izjxnJtE)
- [HttpClient In .NET](https://www.youtube.com/watch?v=g-JGay_lnWI)
- [Generar archivos APK](https://code.tutsplus.com/es/how-to-generate-apk-and-signed-apk-files-in-android-studio--cms-37927t)

---

## Vídeos

### Revisión del proyecto

[Enlace](https://drive.google.com/file/d/1W9ygPesxZU1p28SSNWP7tGrXJTAct0H_/view?usp=sharing)

---

## Anteproyecto

[Enlace](https://big-mercury-2f2.notion.site/Anteproyecto-1c625e1380868064812cf17aef250f8b)
