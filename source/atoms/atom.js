define(['ko', 'text!./atom.tmpl.html'], function(ko, tmpl){
    function Atom(){
        var self = this;

        self.text = ko.observable('atom');
    }

    return {
        viewModel: Atom,
        template: tmpl
    }
});