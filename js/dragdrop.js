(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define([ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {

	var DragDropDraggerFactory = function(args)
    {
        var ddd                 = new DragDropDragger();
        ddd.tgtId               = args.tgtId||null;

        if(!ddd.tgtId)
            throw new TypeError("Error! You did not provide a correct 'tgtId' for the DragDropDragger.tgtId argument ");

        ddd.$target             = $(args.tgtId);
        
        ddd.orig_left           = ddd.$target.position().left;
        ddd.orig_top            = ddd.$target.position().top;

        //REFRESH BUG / HACK
        if((ddd.orig_left == 0) && (ddd.orig_top == 0))
        {
            //poll for something that isn't 0,0
            var intID  = setInterval(function(){

                log('refresh polling for layout!');
                ddd.orig_left           = ddd.$target.position().left;
                ddd.orig_top            = ddd.$target.position().top;
                if((ddd.orig_left != 0) && (ddd.orig_top != 0))
                {
                    clearInterval(intID);
                }
            },200);
        }

        ddd.boundsId            = args.boundsId||DragDropDragger.DEFAULT_BOUNDS;
        ddd.draggingClass       = args.draggingClass||DragDropDragger.DEFAULT_DRAGGING_CLASS;
        ddd.placedClass         = args.placedClass||DragDropDragger.DEFAULT_PLACED_CLASS;

        ddd.$target.attr('name',ddd.tgtId);

        ddd.$target.draggable({
            revert: "invalid",
            containment:ddd.boundsId,
            start:  function(event,ui){ ddd.start(event,ui); },
            drag:   function(event,ui){ ddd.drag(event,ui); },
            stop:   function(event,ui){ ddd.stop(event,ui); }
        });

        return ddd;
    };

    var DragDropDragger = function()
    {
        this.orig_left          = "";
        this.orig_top           = "";
        this.$target            = "";
        this.tgtId              = "";
        this.draggingClass      = "";
        this.placedClass        = "";
        this.boundsId           = "";
        this.currentDDZ         = undefined;
        this.controller         = undefined;



        this.start = function(event,ui)
        {
            $( event.target )
                .removeClass(this.placedClass)
                .addClass(this.draggingClass);
        };

        this.drag = function(event,ui)
        {

        };

        this.stop = function(event,ui)
        {

        };

        this.reset = function()
        {
            var self = this;


            var targets = {
                 left : this.orig_left,
                 top : this.orig_top
            };

            self.controller.isLocked = true;

            self.setDraggingStyle();

            self.currentDDZ         = undefined;

            self.$target.draggable('enable');

            $(self.$target).animate(
                targets,
                {
                    duration:300,
                    complete: function(event,ui)
                    {
                        self.controller.isLocked = false;
                    }

                });


        };

        this.setDraggingStyle = function()
        {
            this.$target
                .removeClass(this.placedClass)
                .addClass(this.draggingClass);
        };

        this.setAsPlacedStyle = function()
        {
            this.$target
                .removeClass(this.draggingClass)
                .addClass(this.placedClass);
        };

        this.centreInDDZ = function(ddz)
        {
            var $ddz = ddz.$tgt;
            var dfd = $.Deferred();
            var ddzPosition         = $ddz.position();
            var ddzHalfWidth        = $ddz.width()/2;
            var ddzHalfHeight       = $ddz.height()/2;

            var self = this;

            //if this currentdropzone then make sure we unhook the dragger from it now
            if(self.currentDDZ)
                self.currentDDZ.currentDragger = undefined;

            //assign the currentDDZ to the one we're on
            self.currentDDZ = ddz;

            //if this dropzones currentDragger existed then unlink it 
            if(ddz.currentDragger)
                ddz.currentDragger.currentDDZ = undefined;

            //assign the current Dragger
            ddz.currentDragger = self;


            var targetPosition = {
                left : (ddzPosition.left + ddzHalfWidth) - (self.$target.width()/2),
                top : (ddzPosition.top + ddzHalfHeight) - (self.$target.height()/2)
            };

            self.controller.isLocked = true;
            $(self.$target).animate(
                targetPosition,
                {
                    duration:300,
                    complete: function(event,ui)
                    {
                        self.setAsPlacedStyle();
                        dfd.resolve();
                        self.controller.isLocked = false;
                    }


                });

            self.$target.draggable('disable');

            return dfd.promise();


        };
    };

    DragDropDragger.DEFAULT_BOUNDS = "#wrapper";
    DragDropDragger.DEFAULT_DRAGGING_CLASS = "ddd-dragging";
    DragDropDragger.DEFAULT_PLACED_CLASS = "ddd-placed";




    var DragDropZoneFactory = function(args)
    {
        var ddz = new DragDropZone();

        ddz.targetId               = args.targetId;
        if(!ddz.targetId)
            throw new TypeError("Error! You did not provide a correct 'tgtId' for the DragDropZone.targetId argument ");

        ddz.$tgt                   = $(ddz.targetId);

        ddz.neutralClass           = args.neutralClass||DragDropZone.DEFAULT_NEUTRAL_CLASS;
        ddz.correctClass           = args.correctClass||DragDropZone.DEFAULT_CORRECT_CLASS;
        ddz.incorrectClass         = args.incorrectClass||DragDropZone.DEFAULT_INCORRECT_CLASS;


        //protect against null
        ddz.correctDraggers        = args.correctDraggers || [];
        ddz.acceptedDraggers        = args.acceptedDraggers || [];


        var classAccepter = ddz.targetId.substring(1)+"-acceptable";
        $.each(ddz.acceptedDraggers,function(i,args){
            //add classes to it 
            this.$target.addClass(classAccepter);           
        });



        //now shallow copy
        ddz.correctDraggers        = args.correctDraggers.slice(0)||[];
        ddz.acceptedDraggers       = args.acceptedDraggers.slice(0)||[];
        ddz.currentDragger         = null;

        ddz.$tgt.droppable({
            activeClass: "ui-state-hover",
            hoverClass: "ui-state-active",
            drop: function( event, ui ) {
                ddz.onDrop(event,ui);
            },
            accept: "."+classAccepter
        });

        return  ddz;
    } ;



    var DragDropZone = function()
    {
        this.targetId               = "";
        this.$tgt                   = null;

        this.neutralClass           = "neutraldropzone";
        this.correctClass           = "correctdropzone";
        this.incorrectClass         = "incorrectdropzone";

        this.correctDraggers        = [];
        this.acceptedDraggers       = [];
        this.currentDragger        = null;

        this.controller             = null;

        this.isRevealed             = false;

        this.onDrop = function(event,ui)
        {
            var wasDroppedOk = false;
            var self = this;
            var $ddd = ui.draggable;
            var dddName = $ddd.attr('name');

            $.each(self.acceptedDraggers,function(i,args){
               if(dddName == self.acceptedDraggers[i].tgtId)
               {
                   var dddObj =  this;
                   wasDroppedOk = true;

                   if(self.currentDragger)
                       self.currentDragger.reset();
                   dddObj.centreInDDZ(self);
                   dddObj.setAsPlacedStyle();
                   self.currentDragger = dddObj;

                   if(self.controller)
                       self.controller.configureButtons();

               }
            });


        };

        this.hasIsCorrectAlready = function()
        {

            if(!this.currentDragger)
                return false;

            var isCorrect = false;
            var self = this;
            var dddName = this.currentDragger.tgtId;
            $.each(self.correctDraggers,function(i,args){
               if(dddName == this.tgtId)
               {
                    isCorrect = true;
               }
           });

           return isCorrect;
        };

        this.reveal = function()
        {
            log("Revealing the dropzone "+ this.targetId);
            var self = this;
            var placed = [];

            if(self.hasIsCorrectAlready())
            {
                self.setCorrect();
                return;
            }

            if(self.currentDragger)
                self.currentDragger.reset();

            self.setNeutral();

            var foundCorrectDragger = false;
            $.each(self.correctDraggers, function(i, args)
            {
                var correctInstance = this;

                if(correctInstance.currentDDZ)
                {
                    if(correctInstance.currentDDZ.hasIsCorrectAlready())
                       return true;
                }

                self.isRevealed = true;

                self.setCorrect();

                log("Correct Picked "+correctInstance.tgtId);   
                //NB : later i'll need to detect placed in case multiple supported answers
                foundCorrectDragger = true;

                correctInstance.setDraggingStyle();

                correctInstance.centreInDDZ(self);
                   
                return false;

            });


        };

        this.submit = function()
        {
            var self = this;

            if(self.isRevealed) return;

            var cDraggerName = self.currentDragger ? self.currentDragger.tgtId : "" ;
            var wasCorrect = false;
            self.setNeutral();


            $.each(self.correctDraggers,function(i,args){
                var dddObj =  this;
                if(dddObj.tgtId == cDraggerName)
                {
                    //its correct so mark it and
                    wasCorrect = true;
                    return false;
                }
            });

            if(wasCorrect)
                self.setCorrect();
            else
                self.setIncorrect();

        };

        this.reset = function () {
            this.isRevealed = false;
            this.setNeutral();
            this.currentDragger = null;
        };

        this.setCorrect = function()
        {
            this.$tgt.addClass(this.correctClass);
            this.$tgt.removeClass(this.incorrectClass);
            this.$tgt.removeClass(this.neutralClass);

        };

        this.setNeutral = function()
        {
            this.$tgt.removeClass(this.correctClass);
            this.$tgt.removeClass(this.incorrectClass);
            this.$tgt.addClass(this.neutralClass);

        };

        this.setIncorrect = function()
        {
            this.$tgt.removeClass(this.correctClass);
            this.$tgt.addClass(this.incorrectClass);
            this.$tgt.removeClass(this.neutralClass);

        };


    };

    DragDropZone.DEFAULT_NEUTRAL_CLASS =  "neutraldropzone";
    DragDropZone.DEFAULT_CORRECT_CLASS =  "correctdropzone";
    DragDropZone.DEFAULT_INCORRECT_CLASS =  "incorrectdropzone";


    var DragDropControllerFactory = function(setupArgs)
    {
        var  newdd = new DragDropController();
        newdd.$resetButton = setupArgs.$resetButton || null;
        newdd.$revealButton = setupArgs.$revealButton || null;
        newdd.$submitButton = setupArgs.$submitButton || null;

        newdd.allDraggers    = [];
        newdd.allZones       = [];


        if(setupArgs.dropzones)
            $.each(setupArgs.dropzones,function(){
               newdd.addZone(this);
            });
        if(setupArgs.draggers)
            $.each(setupArgs.draggers,function(){
                newdd.addDragger(this);
            });

        if(newdd.$resetButton)
            newdd.$resetButton.click(function(e)
            {
                if(!$(this).hasClass(DragDropController.INACTIVE_BUTTON_CLASS))
                    newdd.reset(e);
            });
        if(newdd.$revealButton)
            newdd.$revealButton.click(function(e)
            {
                if(!$(this).hasClass(DragDropController.INACTIVE_BUTTON_CLASS))
                    newdd.reveal(e);
            });
        if(newdd.$submitButton)
            newdd.$submitButton.click(function(e)
            {
                if(!$(this).hasClass(DragDropController.INACTIVE_BUTTON_CLASS))
                   newdd.submit(e);
            });




        return newdd;
    };

    var DragDropController = function()
    {
        //access to factory functions construct

        this.allDraggers    = [];
        this.allZones       = [];

        this.$resetButton = null;
        this.$revealButton = null;
        this.$submitButton = null;

        this.isLocked = false;

    };

    DragDropController.prototype.addDragger = function(dragger)
    {
        this.allDraggers.push(dragger);
        dragger.controller = this;

    };

    DragDropController.prototype.configureButtons = function(forceSOff,forceRevOff)
    {
        forceSOff = forceSOff || false;
        forceRevOff = forceRevOff || false;

        var enableSubmit = true;
        $.each(this.allZones,function()
        {
           //this is now the zone
           if(!this.currentDragger)
           {
               enableSubmit = false;
               return false;
           }

        });

        if(enableSubmit && !forceSOff)
            this.$submitButton.removeClass(DragDropController.INACTIVE_BUTTON_CLASS);
        else
            this.$submitButton.addClass(DragDropController.INACTIVE_BUTTON_CLASS);


        if(!forceRevOff)
            this.$revealButton.removeClass(DragDropController.INACTIVE_BUTTON_CLASS);
        else
            this.$revealButton.addClass(DragDropController.INACTIVE_BUTTON_CLASS);

    };

    DragDropController.prototype.addZone = function(zone)
    {
        this.allZones.push(zone);
        zone.controller = this;
    };


    DragDropController.prototype.reset = function(event)
    {
        var self = this;
        if(self.isLocked) return;
        log('Clicked reset');
        $.each(self.allDraggers,function(){
            this.reset();
        });

        $.each(self.allZones,function(){
            this.reset();
        });

        self.configureButtons();
    };

    DragDropController.prototype.reveal = function(event)
    {

        var self = this;
        if(self.isLocked) return;
        log('Clicked reveal');
        $.each(self.allZones,function(){
            this.reveal();
        });

        self.configureButtons(true,true);

    };

    DragDropController.prototype.submit = function(event)
    {
        var self = this;
        if(self.isLocked) return;
        log('Clicked Submit');
        $.each(self.allZones,function(){
            this.submit();
        });

    };

    DragDropController.INACTIVE_BUTTON_CLASS = "inactive-but";


    var DragDrop = {};
    DragDrop.ControllerFactory = DragDropControllerFactory;
    DragDrop.DraggerFactory = DragDropDraggerFactory;
    DragDrop.DropZoneFactory = DragDropZoneFactory;
    DragDrop.Controller = DragDropController;
    DragDrop.Dragger = DragDropDragger;
    DragDrop.DropZone = DragDropZone;

    return DragDrop;


}));