# Atomic Design Build System

http://pellebjerkestrand.github.io/AtomicDesignBuildSystem

A set of tools and helpers to make creating frontend using [Atomic Design](http://bradfrost.com/blog/post/atomic-web-design/) easier.

Atoms, molecules, organisms, templates and pages all go in their respective directories (f.ex. `./source/atoms/link.html`).

## Templating
Templating is done using [Swig](http://paularmstrong.github.io/swig/).

There are custom tags for Atomic Design concepts:

Atom: `{% atom "link" %}`

Molecule: `{% molecule "link-list" %}`

Organism: `{% organism "header" %}`

Template: `{% template "article" %}`

These are all variations of the Swig `include` tag and support the same things it does.

### Pages and Data
In Atomic Design, a page is an instance of a template with some data.

A JSON file in `./source/data/` with the same name as an HTML file in `./source/pages/` is passed to the page during the build process.

## Styles (SCSS)
Just add your SCSS files to the appropriate directory (atoms, molecules etc.) and the build process will take care of finding them and including them in the SASS build.

This is done through globbing in `./source/global/app.scss`. SASS does not support globbing natively, so this is added using `gulp-css-globbing`.

## JavaScript Components
The application's JavaScript is componentized using AMD.

Components are by convention placed in `./source/components/`, but must be registered as a dependency in `./source/global/app.js` to be included in the build.

### Knockout Components
Each component is a [Knockout](http://knockoutjs.com) [Component](http://knockoutjs.com/documentation/component-overview.html).

Example:

```
define(['ko', 'text!./foo.tmpl.html'], function(ko, tmpl){
    function Foo(){
        var self = this;

        self.text = ko.observable('foo');
    }

    return {
        viewModel: Foo,
        template: tmpl
    };
});
```

### Knockout Templates
Templates are by convention placed in the same directory as the component (`./source/components/`) with the name `{component-name}.tmpl.html`.

Example:

```
<div class="foo">
    <input type="text" data-bind="textInput: text" />
    <span data-bind="text: text"></span>
</div>
```

### Registering
Registering a component is done as follows:

```
require(['ko', 'components/foo'], function(ko){
    ko.components.register('foo', {
        require: 'components/foo'
    });

    ko.applyBindings();
});
```

## Building
Run `npm install` to get the dependencies.
Run `gulp` to build.

## Automatic Build While Developing
Run `gulp dev` and watchers will be set up for building HTML, CSS and JS when relevant files change. Watchers for building the style guide will also be set up.

New files do not trigger anything. After adding new files, you must rerun `gulp dev`.

## Deployment & Hosting
`.deployment` and `deploy.sh` take care of building and deploying to an Azure Website, so hosting in one of those is easy as pie. Just link the GitHub repository to the Azure Website and it will auto build and deploy on each commit. Linking repositories that are hosted elsewhere is also easy but might result in you having to set up web hooks manually.

An Azure Website can be had [for free](http://azure.microsoft.com/nb-no/pricing/details/websites/) if you don't need much bandwidth.

This repo's `master` branch currently builds and deploys on [adbs.azurewebsites.net](adbs.azurewebsites.net).

This repo's `develop` branch currently builds and deploys on [adbs-dev.azurewebsites.net](adbs-dev.azurewebsites.net).

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/?repository=https://github.com/pellebjerkestrand/AtomicDesignBuildSystem)

## Auto Generated Style Guide Site
An auto generated style guide site can be found in `./dist/[version]/guide/` after running `gulp build` or `gulp build:guide`.

The guide shows all atoms, molecules and organisms that have an associated JSON file.

The JSON file must be in the same directory as the component and have the same file name.

```
{
    "name": "Component Name" // Optional
    "description": "Component Description" // Optional
}
```

### Component Variations
Instead of making several components to display variations it's possible to make one component and describe variations in the component's JSON file.

The component will be rendered once for each variation and `data` will be passed to the component when rendering.

The following combination will render the `Button` component twice: once with `{ "type": "standard" }` and another with `{ "type": "variant" }`.

```
{
    "name": "Button",
    "description": "A standard button",
    "variations": [
        {
            "name": "Standard",
            "data": {
                "type": "standard"
            }
        },{
            "name": "Variant",
            "data": {
                "type": "variant"
            }
        }
    ]
}
```

```
<button type="button" class="button button--{{ type | default("standard") }}">Button</button>
```

## TODO (maybe)
- Support for auto discovery and running of tests