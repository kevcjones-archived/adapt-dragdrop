A basic component skeleton to help developers create components. All components should have a readme that contains the following:

##Drag and Drop Adapt Component

The idea is simple enough, the drag a drop component needs to support a list of dragger elements and a list of drop zones. Each of the 
drop zones has a list of accepted dragger objects and then a list of 'correct' ones that will be marked as good. There is also support 
for exclusive zones too, so if you make two zones exlusive then they cannot have the same content. This solves any issues with items 
which have the same dragger elements but should be an XOR relationship.

The newer functionality is that dragging behaviour is impossible on very small screen. So as a first version we will simply show the final diagram with no interactivity on a mobile screen. This is the simplest most elegant approach for a mobile viewer.

It might be nice to have a text body which shows after you're done or on mobile which simply comes after the diagram.


##Installation

The aim is to simply simply install the componennt in the same way you would any other. 

<pre>adapt install adapt-dragdrop</pre>

##Usage

For diagrams normally, flow charts are quite a popular choice in my industry for showing cancer pathways and treatments/chemicals which are involved. 
Fill in the blankds and once completed you move onwards to explantions. 


##Settings overview

Basic component with added sugar. 

To build the first part of the interactive is a base graphic to lay things upon. This diagram will is what it is.
This should sit inside a div which will enable us to create a normalised coordinate system for the dropzones.
The drop zones will be positioned by an original X and Y coordinate from the top left, and sized by an original height and width when the diagram is at 1:1 ratio.

The resize event will give us a chance to measure the item to determine its relative scale to this 1:1 scale, and then adjust the position and size of the dropzones accordingly.

Dropzones should be made up as a rule of two parts, a sprite sheet background, and a text forground. 
The sprite backgrounds should follow a rule set :
 - sprites are vertical 
 - they must always contain (neutral,hover, placed, correct, incorrect)
 
 The dragger objects should follow the same rules above in terms of sizing. They but original position will be where they are placed on the diagram.

```
{
    "_id":"c-05",
    "_parentId":"b-05",
    "_type":"component",
    "_component":"adapt-dragdrop",
    "_classes":"",
    "_layout":"full",
    "title":"My Component",
    "displayTitle":"My Component",
    "body":"",
    "instruction":""
}
```
A description of the core settings can be found at: (Core model attributes)[https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes]


### Data description

All attributes for your component should be described here. A description for core attributes can be found here: {Core-model-attributes}(https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes)


Each component should also contain a schema.json file. This is a JSON schema of example.json. This file is needed for the component to work with the editor. It describes what fields are needed to edit the component. 

##Limitations

Please detail any limitation of your component.

##Browser spec

If you have detailed browser spec you should detail them here.