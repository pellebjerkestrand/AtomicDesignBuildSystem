require(['ko', 'atoms/atom'], function(ko){
    ko.components.register('atom', {
        require: 'atoms/atom'
    });

    ko.applyBindings();
});