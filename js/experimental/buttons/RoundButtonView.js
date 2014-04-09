// Copyright 2002-2014, University of Colorado Boulder

/**
 * A round button that draws gradients and such in order to create a somewhat
 * 3D look.  It is provided with a 'button model' that is monitored to change
 * the appearance of the button.
 *
 * @author John Blanco
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // Includes
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var HIGHLIGHT_GRADIENT_LENGTH = 5; // In screen coords, which are roughly pixels.

  /**
   * @param {Object} buttonModel
   * @param {Object} options
   * @constructor
   */
  function RoundButtonView( buttonModel, options ) {

    var thisButton = this;

    if ( !(options.content || options.radius) ) {
      throw new Error( 'RoundButtonView should have content or radius' );
    }

    options = _.extend( {
      // Default values.
      radius: null,
      content: null,
      cursor: 'pointer',
      baseColor: new Color( 153, 206, 255 ),
      disabledBaseColor: new Color( 220, 220, 220 ),
      minXPadding: 5, // Minimum padding in x direction, i.e. on left and right
      minYPadding: 5, // Minimum padding in x direction, i.e. on top and bottom
      listener: null,
      fireOnDown: false,
      touchExpansion: 5, // In screen units (roughly pixels) beyond button's edge.
      stroke: null, // No outline stroke by default
      lineWidth: 1, // Only meaningful if stroke is non-null

      // By default, icons are centered in the button, but icons with odd
      // shapes that are not wrapped in a normalizing parent node may need to
      // specify offsets to line things up properly
      iconOffsetX: 0,
      iconOffsetY: 0
    }, options );

    var content = options.content;

    Node.call( thisButton, { listener: options.listener, fireOnDown: options.fireOnDown } );

    // Create convenience vars for creating the various gradients

    //Choose a radius for the button based on the content and the padding
    //If the user specified the radius of the button explicitly, then use it instead.
    var buttonRadius = options.radius || Math.max( content.width + options.minXPadding * 2, content.height + options.minYPadding * 2 ) / 2;

    var upCenter = new Vector2( options.iconOffsetX, options.iconOffsetY );
    var baseColor = options.baseColor;
    var disabledBaseColor = options.disabledBaseColor;
    var transparentBaseColor = new Color( baseColor.getRed(), baseColor.getGreen(), baseColor.getBlue(), 0 );
    var transparentDisabledBaseColor = new Color( disabledBaseColor.getRed(), disabledBaseColor.getGreen(), disabledBaseColor.getBlue(), 0 );
    var lightenedStroke = null;
    if ( options.stroke ) {
      lightenedStroke = options.stroke instanceof Color ? options.stroke.colorUtilsBrighter( 0.5 ) : new Color( options.stroke ).colorUtilsBrighter( 0.5 );
    }

    // The multiplier below can be varied in order to tweak the highlight appearance.
    var innerGradientRadius = buttonRadius - HIGHLIGHT_GRADIENT_LENGTH / 2;
    var outerGradientRadius = buttonRadius + HIGHLIGHT_GRADIENT_LENGTH / 2;
    var gradientOffset = HIGHLIGHT_GRADIENT_LENGTH / 2;

    // Create the gradient fills used for various button states
    var upFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
      .addColorStop( 0, baseColor )
      .addColorStop( 1, baseColor.colorUtilsBrighter( 0.7 ) );

    var upFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
      .addColorStop( 0, transparentBaseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    var overFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
      .addColorStop( 0, baseColor.colorUtilsBrighter( 0.3 ) )
      .addColorStop( 1, baseColor.colorUtilsBrighter( 0.8 ) );

    var overFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
      .addColorStop( 0, transparentBaseColor )
      .addColorStop( 1, baseColor.colorUtilsDarker( 0.5 ) );

    // Function to create a fill that represents a pressed in round button.
    function createPressedFill( color ) {
      return new RadialGradient( -gradientOffset, -gradientOffset, 0, 0, 0, outerGradientRadius )
        .addColorStop( 0, color.colorUtilsDarker( 0.1 ) )
        .addColorStop( 0.6, color.colorUtilsDarker( 0.2 ) )
        .addColorStop( 0.8, color )
        .addColorStop( 1, color.colorUtilsBrighter( 0.8 ) );
    }

    var pressedFill = createPressedFill( baseColor );

    var disabledFillHighlight = new RadialGradient( gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius )
      .addColorStop( 0, disabledBaseColor )
      .addColorStop( 1, disabledBaseColor.colorUtilsBrighter( 0.5 ) );

    var disabledFillShadow = new RadialGradient( -gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius )
      .addColorStop( 0, transparentDisabledBaseColor )
      .addColorStop( 1, disabledBaseColor.colorUtilsDarker( 0.5 ) );

    var disabledPressedFillHighlight = createPressedFill( disabledBaseColor );

    // Create the basic button shape.
    var background = new Circle( buttonRadius,
      {
        fill: options.baseColor,
        lineWidth: options.lineWidth
      } );
    this.addChild( background );

    // Create the overlay that is used to add shading.
    var overlayForShadowGradient = new Circle( buttonRadius,
      {
        fill: options.baseColor,
        stroke: options.stroke,
        lineWidth: options.lineWidth
      } );
    this.addChild( overlayForShadowGradient );

    if ( content ) {
      content.center = upCenter;
      thisButton.addChild( content );
    }

    //Set the opacity of the content, but only if it exists
    function setContentOpacity( opacity ) {
      if ( content ) {
        content.opacity = opacity;
      }
    }

    // Hook up the function that will modify button appearance as the state changes.
    buttonModel.interactionStateProperty.link( function( interactionState ) {

      switch( interactionState ) {

        case 'idle':
          setContentOpacity( 1 );
          background.fill = upFillHighlight;
          overlayForShadowGradient.stroke = options.stroke;
          overlayForShadowGradient.fill = upFillShadow;
          thisButton.cursor = 'pointer';
          break;

        case 'over':
          setContentOpacity( 1 );
          background.fill = overFillHighlight;
          overlayForShadowGradient.stroke = options.stroke;
          overlayForShadowGradient.fill = overFillShadow;
          thisButton.cursor = 'pointer';
          break;

        case 'pressed':
          setContentOpacity( 1 );
          background.fill = pressedFill;
          overlayForShadowGradient.stroke = options.stroke;
          overlayForShadowGradient.fill = overFillShadow;
          thisButton.cursor = 'pointer';
          break;

        case 'disabled':
          setContentOpacity( 0.3 );
          background.fill = disabledFillHighlight;
          overlayForShadowGradient.stroke = lightenedStroke;
          overlayForShadowGradient.fill = disabledFillShadow;
          thisButton.cursor = null;
          break;

        case 'disabled-pressed':
          setContentOpacity( 0.3 );
          background.fill = disabledPressedFillHighlight;
          overlayForShadowGradient.stroke = lightenedStroke;
          overlayForShadowGradient.fill = disabledFillShadow;
          thisButton.cursor = null;
          break;
      }
    } );

    // Expand the touch area.
    this.touchArea = Shape.circle( 0, 0, buttonRadius + options.touchExpansion );

    // Set pickable such that sub-nodes are pruned from hit testing.
    this.pickable = null;

    // Mutate with the options after the layout is complete so that
    // width-dependent fields like centerX will work.
    thisButton.mutate( options );
  }

  return inherit( Node, RoundButtonView );
} );