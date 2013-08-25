enyo.kind({
    name: "SmoothPanels",
    classes: "smoothpanels",
    statics: {
        // A couple of built-in animations
        SLIDE_IN_FROM_RIGHT: "slideInFromRight",
        SLIDE_OUT_TO_LEFT: "slideOutToLeft",
        SLIDE_IN_FROM_TOP: "slideInFromTop",
        SLIDE_OUT_TO_BOTTOM: "slideOutToBottom",
        SLIDE_IN_FROM_LEFT: "slideInFromLeft",
        SLIDE_OUT_TO_RIGHT: "slideOutToRight",
        SLIDE_IN_FROM_BOTTOM: "slideInFromBottom",
        SLIDE_OUT_TO_TOP: "slideOutToTop",
        FADE_OUT: "fadeOut",
        FADE_IN: "fadeIn",
        NONE: "none",
        animationEventNames: {
            webkit: {start: "webkitAnimationStart", end: "webkitAnimationEnd"},
            moz: {start: "animationstart", end: "animationend"},
            ms: {start: "MSAnimationStart", end: "MSAnimationEnd"},
            o: {start: "oanimationstart", end: "oanimationend"}
        }
    },
    events: {
        onInAnimationStart: "", // Fired after the in animation has started
        onOutAnimationStart: "", // Fired after the out animation has started
        onInAnimationEnd: "", // Fired after the in animation has ended
        onOutAnimationEnd: "" // Fired after the out animation has ended
    },
    published: {
        // If true, the out animation of the old panel will be started as soon as possible
        // instead of waiting for the new panel to be rendered and painted. The result
        // is a decoupled in and out animation
        async: false,
        inAnim: "slideInFromRight", // Name of the CSS animation to use of the in animation
        outAnim: "slideOutToLeft", // Name of the CSS animation to use of the out animation
        duration: 500, // Duration to use for animations
        easing: "ease" // Timing function to use for animations
    },
    create: function() {
        this.inherited(arguments);
        // Select first panel by default
        var currentPanel = this.currentPanel = this.getClientControls()[0];
        // Hide all other panels
        this.getClientControls().forEach(function(panel) {
            if (panel != currentPanel) {
                panel.hide();
            }
        });
        this.animationStartHandler = enyo.bind(this, this.animationStart);
        this.animationEndHandler = enyo.bind(this, this.animationEnd);
    },
    rendered: function() {
        this.inherited(arguments);
        // Unfortunately we have to add those listeners manually since Enyo does not support
        // handling these by default
        var eNames = SmoothPanels.animationEventNames[this.getVendorPrefix().lowercase];
        console.log(eNames);
        this.hasNode().addEventListener(eNames.start, this.animationStartHandler, false);
        this.hasNode().addEventListener(eNames.end, this.animationEndHandler, false);
    },
    /**
     * @private
     *
     *  Detects the vendor prefix to be used in the current browser
     * 
     * @return {Object} object containing the simple lowercase vendor prefix as well as the css prefix
     * @example
     * 
     *     {
     *         lowercase: "webkit",
     *         css: "-webkit-"
     *     }
     */
    getVendorPrefix: function() {
        if (!this.vPrefix) {
            var styles = window.getComputedStyle(document.documentElement, '');
            var pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];
            this.vPrefix = {
                lowercase: pre,
                css: '-' + pre + '-'
            };
        }
        return this.vPrefix;
    },
    /**
     * @private
     * 
     * Applies a CSS animation to a control
     * 
     * @param  {Object} control  Then enyo.Control to apply the animation to
     * @param  {[type]} anName   The name of the CSS animation to use
     * @param  {[type]} duration The duration to use for the animation
     * @param  {[type]} easing   The timing function to use for the animation
     */
    applyAnimation: function(control, anName, duration, easing) {
        control.applyStyle(
            this.getVendorPrefix().css + "animation",
            anName == "none" ? anName : anName + " " + duration + "ms " + easing
        );
    },
    /**
     * @private
     *
     * Event listener for animationStart event. Delegates to inAnimationStart() or outAnimationStart()
     * based on where the event came from.
     * 
     * @param  {Object} event animationStart event
     */
    animationStart: function(event) {
        console.log("**** animation start ****", arguments);
        if (this.oldPanel && event.target == this.oldPanel.hasNode() && event.animationName == this.currOutAnim) {
            this.outAnimationStart();
        } else if (this.newPanel && event.target == this.newPanel.hasNode() && event.animationName == this.currInAnim) {
            this.inAnimationStart();
        }
    },
    /**
     * @private
     *
     * Event listener for animationEnd event. Delegates to inAnimationEnd() or outAnimationEnd()
     * based on where the event came from.
     * 
     * @param  {Object} event animationEnd event
     */
    animationEnd: function(event) {
        console.log("**** animation end ****", arguments);
        if (this.oldPanel && event.target == this.oldPanel.hasNode() && event.animationName == this.currOutAnim) {
            this.outAnimationEnd();
        } else if (this.newPanel && event.target == this.newPanel.hasNode() && event.animationName == this.currInAnim) {
            this.inAnimationEnd();
        }
    },
    /**
     * @private
     *
     * Shows the newly selected panel and starts the in animation.
     */
    startInAnimation: function() {
        // Prevent the new panel from flashing up on the screen before the animation start
        this.newPanel.applyStyle("opacity", 0);
        this.newPanel.show();
        // Need to start the animation asynchronously after showing because otherwise it is just being skipped in some browsers
        enyo.asyncMethod(this, function() {
            this.applyAnimation(this.newPanel, this.currInAnim, this.duration, this.easing);
            this.newPanel.applyStyle("opacity", 1);
        });
    },
    /**
     * @private
     * 
     * Starts the out animation
     */
    startOutAnimation: function() {
        this.applyAnimation(this.oldPanel, this.currOutAnim, this.duration, this.easing);
    },
    /**
     * @private
     * 
     * Called after the in animation has started. Fires the corresponding SmoothPanels event.
     */
    inAnimationStart: function() {
        this.doInAnimationStart({oldPanel: this.oldPanel, newPanel: this.newPanel});
    },
    /**
     * @private
     *
     * Called after the out animation has started. Fires the corresponding SmoothPanels event
     * and, if _async_ is set to true, starts the in animation.
     */
    outAnimationStart: function() {
        this.doOutAnimationStart({oldPanel: this.oldPanel, newPanel: this.newPanel});
        this.animating = true;
        if (this.async) {
            this.startInAnimation();
        }
    },
    /**
     * @private
     * 
     * Called after the in animation has ended Fires the corresponding SmoothPanes event
     * and removes the animation css property from the new panel.
     */
    inAnimationEnd: function() {
        this.doInAnimationEnd({oldPanel: this.oldPanel, newPanel: this.newPanel});
        this.applyAnimation(this.newPanel, "none");
    },
    /**
     * @private
     * 
     * Called after the out animation has ended Fires the corresponding SmoothPanes event,
     * hides the old panel and removes the animation css property.
     */
    outAnimationEnd: function() {
        this.doOutAnimationEnd({oldPanel: this.oldPanel, newPanel: this.newPanel});
        this.oldPanel.hide();
        this.applyAnimation(this.oldPanel, "none");
        this.animating = false;
    },
    /**
     * Selects the specified panel
     * 
     * @param  {Object} panel   The panel that should be selected. Need to be inside the client controls
     * @param  {String} inAnim  The name of the CSS in animation to use. If specified overwrites the _inAnim_ property
     * @param  {String} outAnim The name of the CSS out animation to use. If specified overwrites the _outAnim_ property
     */
    select: function(panel, inAnim, outAnim) {
        if (!panel) {
            this.warn("The panel you selected is null or undefined!");
            return;
        }
        if (panel == this.currentPanel) {
            // Panel already selected
            return;
        }
        this.currInAnim = inAnim || this.inAnim;
        this.currOutAnim = outAnim || this.outAnim;
        if (this.animating) {
            // There is already a transition going on. Wrap it up prematurely
            this.inAnimationEnd();
            this.outAnimationEnd();
        }
        this.oldPanel = this.currentPanel;
        this.newPanel = this.currentPanel = panel;
        this.startOutAnimation();
        if (this.currOutAnim == SmoothPanels.NONE) {
            // No out animation. This means there won't be any animationStart or animationEnd events
            // so we'll have to handle that manually
            this.outAnimationStart();
            setTimeout(enyo.bind(this, function() {
                this.outAnimationEnd();
            }), this.duration + 500); // Add an extra 500 ms just to be sure
        }
        if (!this.async) {
            // The _async_ property is set to false so we don't have to wait for the out animation to start
            this.startInAnimation();
        }
    },
    /**
     * Selects a panel directly without any animation.
     * 
     * @param  {Object} panel The panel to select
     */
    selectDirect: function(panel) {
        if (this.currentPanel == panel) {
            // Panel is already selected
            return;
        }
        panel.show();
        this.currentPanel.hide();
        this.currentPanel = panel;
    },
    /**
     * Selects a panel by its index in the client controls.
     * 
     * @param  {Number} index   The index of the panel to select (0-based)
     * @param  {String} inAnim  The name of the CSS in animation to use. If specified overwrites the _inAnim_ property
     * @param  {String} outAnim The name of the CSS out animation to use. If specified overwrites the _outAnim_ property
     */
    selectByIndex: function(index, inAnim, outAnim) {
        this.select(this.getClientControls()[index], inAnim, outAnim);
    },
    /**
     * Returns the currently selected panel.
     * 
     * @return {Object} The currently selected panel
     */
    getSelectedPanel: function() {
        return this.currentPanel;
    },
    /**
     * Returns the index of the currently selected panel.
     * 
     * @return {Number} The index of the currently selected panel
     */
    getSelectedPanelIndex: function() {
        return this.getClientControls().indexOf(this.currentPanel);
    },
    destroy: function() {
        // Since we added those handlers manually, we have to remove them manually, too.
        var eNames = SmoothPanels.animationEventNames[this.getVendorPrefix().lowercase];
        this.hasNode().removeEventListener(eNames.start, this.animationStartHandler, false);
        this.hasNode().removeEventListener(eNames.end, this.animationEndHandler, false);
        this.inherited(arguments);
    }
});