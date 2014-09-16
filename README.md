##Drag and Drop Adapt Component
##Installation

The aim is to simply simply install the componennt in the same way you would any other. 

<pre>adapt install adapt-dragdrop</pre>

##Usage

The component is going to include Jquery UI and the Touch Punch libs or you via requireJS.

The only step you need to manually perform is to make sure you have a copy o the default LESS and add your own overrides. Seeing that the 'body' tag is going to be a manual experience every time i didn't want to hard code defaults for the body below into it.  If you wanted to just get the demo running then make a copy of the example.less file i've provided which overrides the defaults and adds in extra for demonstration purposes.

I myself extend the GruntFile to pull in less files from inside my course folder. To each their own.


##Settings overview

Basic component with added sugar. 

Draggable items are as you would expect things that you drag
Droppable items (followed JQUERY UI naming here) are dropzones which you drop things into
The system uses id's to relate them to eachother.

```
{
    "_id":"c-05",
    "_parentId":"b-05",
    "_type":"component",
    "_component":"dragdrop",
    "_classes":"",
    "_layout":"full",
    "_attempts": 2,
    "_questionWeight":10,
    "title": "Drag Drop Demo",
    "displayTitle": "Demo of dragdrop widget",
    "body": "Drag the items below into the correct slots",
    "instruction":"",
    "_buttons":{
        "submit":"Submit",
        "reset":"Reset",
        "showCorrectAnswer":"Model Answer",
        "hideCorrectAnswer":"Your Answer"
    },
    "_feedback": {
        "correct": "This feedback will appear if you answered the question correctly.",
        "_incorrect": {
            "notFinal": "This feedback will appear if you answered part of the question correctly.",
            "final": "This feedback will appear if you answered the question incorrectly."
        },
        "_partlyCorrect": {
            "notFinal": "This feedback will appear if you answered part of the question correctly.",
            "final": "This feedback will appear if you answered part of the question correctly."
        }
    },
    "_background" : "<div class='bg-item bg-item-1'><p>What is the better before 'B'?</p></div><div class='bg-item bg-item-2'>Which letter is after 'A'?</div><div class='bg-item bg-item-3'>Which letter is after 'B'?</div>",
    "_draggableItems": [
        {
            "id" : "draggerA",
            "class":"draggable-01",
            "innerBody" : "<div>A</div>"
        },
        {
            "id" : "draggerB",
            "class":"draggable-01",
            "innerBody" : "<div>B</div>"
        },
        {
            "id" : "draggerC",
            "class":"draggable-01",
            "innerBody" : "<div>C</div>"
        }
    ],
    "_items": [
        {
            "id":"dropperA",
            "class":"dropzone-01",
            "innerBody": "",
            "_accepted": [
                {
                    "id": "draggerA",
                    "_isCorrect": true
                },
                {
                    "id": "draggerB",
                    "_isCorrect": false
                },
                {
                    "id": "draggerC",
                    "_isCorrect": false
                }
            ]
        },
        {
            "id":"dropperB",
            "class":"dropzone-01",
            "innerBody": "",
            "_accepted": [
                {
                    "id": "draggerA",
                    "_isCorrect": false
                },
                {
                    "id": "draggerB",
                    "_isCorrect": true
                },
                {
                    "id": "draggerC",
                    "_isCorrect": false
                }
            ]
        },
        {
            "id":"dropperC",
            "class":"dropzone-01",
            "innerBody": "",
            "_accepted": [
                {
                    "id": "draggerA",
                    "_isCorrect": false
                },
                {
                    "id": "draggerB",
                    "_isCorrect": false
                },
                {
                    "id": "draggerC",
                    "_isCorrect": true
                }
            ]
        }

    ]
}
```

### Data description


_draggableItems - all things draggable contain configs for DOM attributes 'id', 'class' and 'innerBody aka text' 
_items - dropzone items, using the QuestionView these are what is marked, they have a custom attribute "_accepted" which is an array of acceptable draggable items that can be dropped on them and which one is correct there within.

TODO :// Each component should also contain a schema.json file. This is a JSON schema of example.json. This file is needed for the component to work with the editor. It describes what fields are needed to edit the component. 

##Limitations

This component for now is really early stages, relies on a one to one draggable to droppable ratio. It might allow more, but its untested. 

Future plans 

- add in draggable groups to allow multiple items to be correct interachanably - something i need specifically for medical diagrams where there is more than one correct answer.

- adding in background image demo

- create more customisation behaviour via config files

##Browser spec

If you have detailed browser spec you should detail them here.