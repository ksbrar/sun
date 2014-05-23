// Copyright 2002-2014, University of Colorado Boulder

/**
 * Visual representation of a rectangular button that uses gradients in order
 * to create a somewhat 3D look.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SUN/buttons/ButtonListener' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var VERTICAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
  var HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH = 7; // In screen coords, which are roughly pixels.
  var SHADE_GRADIENT_LENGTH = 3; // In screen coords, which are roughly pixels.
  var DEFAULT_COLOR = new Color( 153, 206, 255 );

  /**
   * @param {ButtonModel} buttonModel - Model that defines the button's behavior.
   * @param {Property} interactionStateProperty - A property that is used to drive the visual appearance of the button.
   * @param {Object} options
   * @constructor
   */
  function RectangularButtonView( buttonModel, interactionStateProperty, options ) {
    this.buttonModel = buttonModel; // @protected
    var thisButton = this;

    options = _.extend( {
      // Default values.
      content: null,
      minWidth: 1,
      minHeight: 1,
      cursor: 'pointer',
      cornerRadius: 4,
      baseColor: DEFAULT_COLOR,
      disabledBaseColor: new Color( 220, 220, 220 ),
      xMargin: 5,
      yMargin: 5,
      fireOnDown: false,
      xTouchExpansion: 5,
      yTouchExpansion: 5,
      stroke: DEFAULT_COLOR.colorUtilsDarker( 0.4 ),
      lineWidth: 0.5, // Only meaningful if stroke is non-null

      // Strategy for controlling the button background's appearance.  This
      // must be usable as a constructor (i.e. using 'new'). It can be a stock
      // strategy from this file, or custom.  To create a custom one, model it
      // off of the stock strategies defined in this file.
      BackgroundAppearanceStrategy: RectangularButtonView.ThreeDAppearanceStrategy,

      // Strategy for controlling the appearance of the button's content based
      // on the button's state.  This must be usable as a constructor (i.e.
      // using 'new'). It can be a stock strategy from this file, or custom.
      // To create a custom one, model it off of the stock version(s) defined
      // in this file.
      ContentAppearanceStrategy: RectangularButtonView.FadeContentWhenDisabled,

      // The following function controls how the appearance of the content
      // node is modified when this button is disabled.
      setContentEnabledLook: function( enabled ) {
        if ( content ) {
          enabled ? content.opacity = 1.0 : content.opacity = 0.3;
        }
      }
    }, options );

    Node.call( thisButton );

    // Hook up the input listener
    this.addInputListener( new ButtonListener( buttonModel ) );

    // Figure out the size of the button.
    var content = options.content;
    var buttonWidth = Math.max( content ? content.width + options.xMargin * 2 : 0, options.minWidth );
    var buttonHeight = Math.max( content ? content.height + options.yMargin * 2 : 0, options.minHeight );

    // Create the basic button shape.
    var background = new Rectangle( 0, 0, buttonWidth, buttonHeight, options.cornerRadius, options.cornerRadius,
      {
        fill: options.baseColor,
        lineWidth: options.lineWidth
      } );
    this.addChild( background );

    // Create and hook up the strategy that will control the background appearance.
    // TODO: Do we need to keep a reference so it doesn't get garbage
    // TODO: collected, or could this just be a var?
    this.backgroundAppearanceStrategy = new options.BackgroundAppearanceStrategy( background, interactionStateProperty, options );

    // Add the content to the button.
    if ( content ) {
      content.center = background.center;
      thisButton.addChild( content );
    }

    // Control the content's appearance based on button state.
    this.contentAppearanceStrategy = new options.ContentAppearanceStrategy( content, interactionStateProperty );

    // Control the pointer state based on the interaction state.
    interactionStateProperty.link( function( state ) {
      thisButton.cursor = state === 'disabled' || state === 'disabled-pressed' ? null : 'pointer';
    } );

    // Add explicit mouse and touch areas so that the child nodes can all be non-pickable.
    this.mouseArea = Shape.rectangle( 0, 0, buttonWidth, buttonHeight );
    this.touchArea = Shape.rectangle( -options.xTouchExpansion, -options.yTouchExpansion, buttonWidth + options.xTouchExpansion * 2, buttonHeight + options.yTouchExpansion * 2 );

    // Mutate with the options after the layout is complete so that width-
    // dependent fields like centerX will work.
    thisButton.mutate( options );
  }

  /**
   * Strategy for making a button look 3D-ish by using gradients that create
   * the appearance of highlighted and shaded edges.
   *
   * @param background
   * @param interactionStateProperty
   * @param options
   * @constructor
   */
  RectangularButtonView.ThreeDAppearanceStrategy = function( background, interactionStateProperty, options ) {

    // Set up variables needed to create the various gradient fills
    var buttonWidth = background.width;
    var buttonHeight = background.height;
    var verticalHighlightStop = Math.min( VERTICAL_HIGHLIGHT_GRADIENT_LENGTH / buttonHeight, 1 );
    var verticalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonHeight, 0 );
    var horizontalHighlightStop = Math.min( HORIZONTAL_HIGHLIGHT_GRADIENT_LENGTH / buttonWidth, 1 );
    var horizontalShadowStop = Math.max( 1 - SHADE_GRADIENT_LENGTH / buttonWidth, 0 );
    var baseColor = Color.toColor( options.baseColor );
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );
    var transparentBaseColor = new Color( baseColor.getRed(), baseColor.getGreen(), baseColor.getBlue(), 0 );
    var transparentDisabledBaseColor = new Color( disabledBaseColor.getRed(), disabledBaseColor.getGreen(), disabledBaseColor.getBlue(), 0 );
    var disabledStroke = null;
    if ( options.stroke ) {
      disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
    }
    var transparentWhite = new Color( 256, 256, 256, 0.7 );

    // Create the gradient fills used for various button states
    var upFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, baseColor )
      .addColorStop( verticalShadowStop, baseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var upFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, transparentWhite )
      .addColorStop( horizontalHighlightStop, transparentBaseColor )
      .addColorStop( horizontalShadowStop, transparentBaseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var overFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( verticalShadowStop, baseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var overFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, transparentWhite )
      .addColorStop( horizontalHighlightStop / 2, new Color( 256, 256, 256, 0 ) )
      .addColorStop( horizontalShadowStop, transparentBaseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.3 ) );

    var downFill = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop * 0.67, baseColor.colorUtilsDarker( 0.3 ) )
      .addColorStop( verticalShadowStop, baseColor.colorUtilsBrighter( 0.2 ) )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var disabledFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, disabledBaseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop, disabledBaseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( verticalShadowStop, disabledBaseColor.colorUtilsBrighter( 0.5 ) )
      .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

    var disabledFillHorizontal = new LinearGradient( 0, 0, buttonWidth, 0 )
      .addColorStop( 0, disabledBaseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( horizontalHighlightStop, transparentDisabledBaseColor )
      .addColorStop( horizontalShadowStop, transparentDisabledBaseColor )
      .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

    var disabledPressedFillVertical = new LinearGradient( 0, 0, 0, buttonHeight )
      .addColorStop( 0, disabledBaseColor.colorUtilsBrighter( 0.7 ) )
      .addColorStop( verticalHighlightStop * 0.67, disabledBaseColor.colorUtilsDarker( 0.3 ) )
      .addColorStop( verticalShadowStop, disabledBaseColor.colorUtilsBrighter( 0.2 ) )
      .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

    // Create the overlay that is used to add horizontal shading.
    var overlayForHorizGradient = new Rectangle( 0, 0, buttonWidth, buttonHeight, options.cornerRadius, options.cornerRadius,
      {
        fill: options.baseColor,
        stroke: options.stroke,
        lineWidth: options.lineWidth
      } );
    background.addChild( overlayForHorizGradient );

    interactionStateProperty.link( function( state ) {
      switch( state ) {

        case 'idle':
          background.fill = upFillVertical;
          overlayForHorizGradient.stroke = options.stroke;
          overlayForHorizGradient.fill = upFillHorizontal;
          break;

        case 'over':
          background.fill = overFillVertical;
          overlayForHorizGradient.stroke = options.stroke;
          overlayForHorizGradient.fill = overFillHorizontal;
          break;

        case 'pressed':
          background.fill = downFill;
          overlayForHorizGradient.stroke = options.stroke;
          overlayForHorizGradient.fill = overFillHorizontal;
          break;

        case 'disabled':
          background.fill = disabledFillVertical;
          background.stroke = disabledStroke;
          overlayForHorizGradient.stroke = disabledStroke;
          overlayForHorizGradient.fill = disabledFillHorizontal;
          break;

        case 'disabled-pressed':
          background.fill = disabledPressedFillVertical;
          background.stroke = disabledStroke;
          overlayForHorizGradient.stroke = disabledStroke;
          overlayForHorizGradient.fill = disabledFillHorizontal;
          break;
      }
    } );
  };

  /**
   * Strategy for buttons that look flat, i.e. no shading or highlighting, but
   * that change color on mouseover, press, etc.
   *
   * @param background
   * @param interactionStateProperty
   * @param options
   * @constructor
   */
  RectangularButtonView.FlatAppearanceStrategy = function( background, interactionStateProperty, options ) {

    // Set up variables needed to create the various gradient fills
    var baseColor = Color.toColor( options.baseColor );
    var disabledBaseColor = Color.toColor( options.disabledBaseColor );
    var disabledStroke = null;
    if ( options.stroke ) {
      disabledStroke = disabledBaseColor.colorUtilsDarker( 0.4 );
    }

    // Create the fills used for various button states
    var upFill = baseColor;
    var overFill = baseColor.colorUtilsBrighter( 0.4 );
    var downFill = baseColor.colorUtilsDarker( 0.4 );
    var disabledFill = disabledBaseColor;
    var disabledPressedFillVertical = disabledFill;

    interactionStateProperty.link( function( state ) {
      switch( state ) {

        case 'idle':
          background.fill = upFill;
          background.stroke = options.stroke;
          break;

        case 'over':
          background.fill = overFill;
          background.stroke = options.stroke;
          break;

        case 'pressed':
          background.fill = downFill;
          background.stroke = options.stroke;
          break;

        case 'disabled':
          background.fill = disabledFill;
          background.stroke = disabledStroke;
          break;

        case 'disabled-pressed':
          background.fill = disabledPressedFillVertical;
          background.stroke = disabledStroke;
          break;
      }
    } );
  };

  /**
   * Basic strategy for controlling content appearance, fades the content by
   * making it transparent when disabled.
   *
   * @param {Node} content
   * @param {Property} interactionStateProperty
   * @constructor
   */
  RectangularButtonView.FadeContentWhenDisabled = function( content, interactionStateProperty ) {
    if ( content ) {
      interactionStateProperty.link( function( state ) {
        content.opacity = state === 'disabled' || state === 'disabled-pressed' ? 0.3 : 1;
      } );
    }
  };

  return inherit( Node, RectangularButtonView,
    {
      set enabled( value ) {
        assert && assert( typeof value === 'boolean', 'RectangularButtonView.enabled must be a boolean value' );
        this.buttonModel.enabled = value;
      },

      get enabled() { return this.buttonModel.enabled; }
    } );
} );