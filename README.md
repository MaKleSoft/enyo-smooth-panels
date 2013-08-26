# enyo-smooth-panels

SmoothPanels is an Enyo panels kind that uses CSS3 animations instead of frame-by-frame Javascript animations

## Installation

If you are using the [Bootplate](https://github.com/enyojs/enyo/wiki/Bootplate) application structure, the best way to include SmoothPanels in your app is to add it as a submodule to your *libs* folder.

    git submodule add https://github.com/MaKleSoft/enyo-smooth-panels.git lib/smooth-panels

Then add the module to your **package.json**.

    enyo.depends(
        ..
        "$lib/smooth-panels"
    );


## Usage

    enyo.kind({
        name: "MyApp",
        components: [
            {kind: "SmoothPanels", components: [
                {name: "firstPanel"},
                {name: "secondPanel"},
                ...
            ]}
        ]
    });

## Published properties

    {
        async: false, // If true, the in and out animations will be decoupled
        inAnim: "slideInFromRight", // Name of the CSS animation to use of the in animation
        outAnim: "slideOutToLeft", // Name of the CSS animation to use of the out animation
        duration: 500, // Duration to use for animations in ms
        easing: "ease" // Timing function to use for animations
    }

## Methods

`select: function(panel, [inAnim], [outAnim])`

Selects the specified **panel**, which needs to be an enyo.Control.

`selectDirect: function(panel)`

Selects a **panel** directly without any animation.

`selectByIndex: function(index, [inAnim], [outAnim])`

Selects a panel by its **index**.

`getSelectedPanel: function()`

Returns the currently selected panel.

`getSelectedPanelIndex: function()`

Returns the index of the currently selected panel.