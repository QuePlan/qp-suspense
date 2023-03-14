# QP Suspense

QP Suspense es una implementación de la lógica de Suspense (al estilo React, Vue, Svelte). Muy en simple (y raptando descaradamente la definición de Suspense que trae React):

> `<Suspense>` lets you display a fallback until its children have finished loading.

Entonces tenemos que aplicando `suspense` podemos, de alguna manera, asegurar que el o los componentes serán desplegados cuando efectivamente estén listos para ser desplegados. Y mientras tanto se muestra un loader (*fallback*).

## Requerimientos

De momento el único requerimiento es una versión de Angular >= v14 , ya que  utiliza componentes y directivas `standalone`.

## Instalación

La librería aún no está publicada en NPM, sin embargo se puede instalar desde el repositorio Github, referenciando directamente el paquete:

`npm install https://github.comQuePlan/qp-suspense/releases/download/v1.0.0/qp-suspense-v1.0.0.tgz`

Versiones disponibles: https://github.com/QuePlan/qp-suspense/releases

## Suspense en Angular

Resumiendo mucho el uso de este componente, el caso de uso más simple es: 

```
<suspense>
  <ng-template [defaultView]="myComponentFactory"></ng-template>
  <ng-template fallbackView>
    <p>Cargando componente MyComponent</p>
  </ng-template>
  <ng-template errorView>
    <p>ERROR cargando componente MyComponent</p>
  </ng-template>
</suspense>
```

y bajo el supuesto que el código no sea lo suficiente autoexplicativo:

* defaultView : es donde se va a desplegar el componente Suspenseable. Recibe como valor el import asociado a la clase donde se ha definido el componente.
* fallbackView : es el loader que se mostrará mientras el componente efectivamente se carga.
* errorView : es el componente que se va a desplegar en caso de presentarse errores en la carga del componente.

Si se desea minimizar el LCP reservando el espacio para el componente, se puede utilizar un elemento HTML, con estilos o clases CSS; y usar suspense como una
directiva de tipo atributo:

```
<section suspense style="display: block; min-height: 15rem;">
  <ng-template [defaultView]="usersFactory" [componentParams]="componentParams"></ng-template>

  <ng-template fallbackView>
    <h4>Fetching Users...</h4>
  </ng-template>
</section>
```

Casos de uso
==============

* Componentes cargados de manera lazy.
* Componentes definidos dentro de un módulo, cargados de manera lazy.
* Componentes cuya carga está definida por marcas de estado `setupReady` y  `hasError`.
* Componentes que informan su estado de cargado o error a través de un  evento.
* Componentes que son cargados de manera no-lazy.

En todos los casos, los componentes deben estar definidos como alguna variedad de Suspenseable, y según sea la clase que extienden, serán los métodos que van a requerir implementar (los subtipos + OOP se encargan de esa magia).

Para mayor información se recomienda ejecutar el proyecto de ejemplo:

`npm start -- --configuration=development --project qp-suspense-demo --o`

El detalle cada caso supuestamente está bien documentado.
