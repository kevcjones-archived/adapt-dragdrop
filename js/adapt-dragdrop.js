/*
* adapt-component
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Kevin Jones <him@kevincjones.co.uk>
*/

define(["coreViews/questionView", "coreJS/adapt","./jquery-ui.js","./jquery.ui.touch-punch.js"], function(QuestionView, Adapt, JQueryUI, touchPunch) {


    var DragDrop = QuestionView.extend({

        events: {
            "click .dragdrop-widget .button.submit": "onSubmitClicked",
            "click .dragdrop-widget .button.reset": "onResetClicked",
            "click .dragdrop-widget .button.model": "onModelAnswerClicked",
            "click .dragdrop-widget .button.user": "onUserAnswerClicked"
        },


        
        postRender: function() {
            console.log("rendering");

            // IMPORTANT! 
            // Both of the following methods need to be called inside your view.

            // Use this to set the model status to ready. 
            // It should be used when telling Adapt that this view is completely loaded.
            // This is sometimes used in conjunction with imageReady.
            this.setReadyStatus();

            // Use this to set the model status to complete.
            // This can be used with inview or when the model is set to complete/the question has been answered.
            this.setCompletionStatus();
        },

        onResetClicked: function(event) {
            event.preventDefault();
        },

        onSubmitClicked: function(event) {
           event.preventDefault();
        },

        onModelAnswerShown: function() {
            event.preventDefault();
        },

        onUserAnswerShown: function(event) {
           event.preventDefault();
        }
        
    });
    
    Adapt.register("dragdrop", DragDrop);
    
});