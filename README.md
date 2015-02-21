# Atomic Design Build System

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
The applications JavaScript is componentized using AMD. Components can be included in any Atomic Design directory, but must be registered as a dependency in `./source/global/app.js` to be included in the build.

### Knockout Components
Each component is a [Knockout](http://knockoutjs.com) [Component](http://knockoutjs.com/documentation/component-overview.html).

Example:

```
define(['ko', 'text!./atom.tmpl.html'], function(ko, tmpl){
    function Atom(){
        var self = this;

        self.text = ko.observable('atom');
    }

    return {
        viewModel: Atom,
        template: tmpl
    };
});
```

### Knockout Templates
Templates are by convention placed in the same directory as the component with the name `{component}.tmpl.html`.

Example:

```
<div class="atom">
    <input type="text" data-bind="textInput: text" />
    <span data-bind="text: text"></span>
</div>
```

### Registering
Registering a component is done as follows:

```
require(['ko', 'atoms/atom'], function(ko){
    ko.components.register('atom', {
        require: 'atoms/atom'
    });

    ko.applyBindings();
});
```

## Building
Run `npm install` to get the dependencies.
Run `gulp` to build.

## TODO (maybe)
- Support for testing
- Watching files to trigger build
- Built in web server
- Style guide site generation