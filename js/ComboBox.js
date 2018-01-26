// Copyright 2013-2017, University of Colorado Boulder

/**
 * Scenery-based combo box. Composed of a button and a list of items.
 * The list of items is displayed when the button is pressed, and dismissed an item is selected
 * or the user clicks outside the list.  The list can be displayed either above or below the button.
 *
 * An item in the combo box has 2 properties: {Node} node, {*} value.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ComboBoxIO = require( 'SUN/ComboBoxIO' );
  var ComboBoxItemNodeIO = require( 'SUN/ComboBoxItemNodeIO' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {*[]} items - see ComboBox.createItem
   * @param {Property} property
   * @param {Node} listParent node that will be used as the list's parent, use this to ensuring that the list is in front of everything else
   * @param {Object} [options] object with optional properties
   * @constructor
   */
  function ComboBox( items, property, listParent, options ) {

    var self = this;

    options = _.extend( {

      labelNode: null, // optional label, placed to the left of the combo box
      labelXSpacing: 10, // horizontal space between label and combo box
      enabledProperty: new Property( true ),
      disabledOpacity: 0.5, // {number} opacity used to make the control look disabled

      // button
      buttonFill: 'white',
      buttonStroke: 'black',
      buttonLineWidth: 1,
      buttonCornerRadius: 8,
      buttonXMargin: 10,
      buttonYMargin: 4,

      // list
      listPosition: 'below', // where the list is positioned relative to the button, either 'below' or 'above'
      listYMargin: 4,
      listFill: 'white',
      listStroke: 'black',
      listLineWidth: 1,
      listCornerRadius: 5,

      // items
      itemXMargin: 6,
      itemYMargin: 6, // Vertical margin applied to the top and bottom of each item in the popup list.
      itemHighlightFill: 'rgb(245,245,245)',
      itemHighlightStroke: null,
      itemHighlightLineWidth: 1,

      // tandem
      tandem: Tandem.required,
      phetioType: ComboBoxIO,

      // a11y
      a11yButtonLabel: '' // {string} accessible label for the button that opens this combobox
    }, options );

    // validate option values
    assert && assert( options.disabledOpacity > 0 && options.disabledOpacity < 1, 'invalid disabledOpacity: ' + options.disabledOpacity );

    Node.call( this );

    this.enabledProperty = options.enabledProperty; // @public

    // optional label
    if ( options.labelNode !== null ) {
      self.addChild( options.labelNode );
    }

    // determine uniform dimensions for button and list items (including margins)
    var itemWidth = Math.max.apply( Math, _.map( items, 'node.width' ) ) + 2 * options.itemXMargin;
    var itemHeight = Math.max.apply( Math, _.map( items, 'node.height' ) ) + 2 * options.itemYMargin;

    // list
    var listWidth = itemWidth + ( 2 * options.buttonXMargin );
    var listHeight = ( items.length * itemHeight ) + ( 2 * options.listYMargin );
    var listNode = new Rectangle( 0, 0, listWidth, listHeight, {
      cornerRadius: options.listCornerRadius,
      fill: options.listFill,
      stroke: options.listStroke,
      lineWidth: options.listLineWidth,
      visible: false,
      // Not instrumented for PhET-iO because the list's location isn't valid until it has been popped up.
      // See https://github.com/phetsims/phet-io/issues/1102
      
      // a11y 
      tagName: 'ul',
      ariaRole: 'menu',
      groupFocusHighlight: true
    } );
    listParent.addChild( listNode );

    //TODO move these to ComboBoxItemNode
    // how to highlight an item in the list
    var highlightItem = function( itemNode ) {
      itemNode.fill = options.itemHighlightFill;
      itemNode.stroke = options.itemHighlightStroke;
    };
    var unhighlightItem = function( itemNode ) {
      itemNode.fill = null;
      itemNode.stroke = null;
    };

    // listener that we'll attach to each item in the list
    var itemListener = {
      enter: function( event ) {
        highlightItem( event.currentTarget );
      },
      exit: function( event ) {
        unhighlightItem( event.currentTarget );
      },
      down: function( event ) {
        event.abort(); // prevent click-to-dismiss on the list
      },
      up: function( event ) {
        var selectedItemNode = event.currentTarget; // {ComboBoxItemNode}

        selectedItemNode.startEvent( 'user', 'fired', {

          // support uninstrumented sims
          value: selectedItemNode.phetioType &&
                 selectedItemNode.phetioType.elementType &&
                 selectedItemNode.phetioType.elementType.toStateObject &&
                 selectedItemNode.phetioType.elementType.toStateObject( selectedItemNode.item.value )
        } );

        unhighlightItem( selectedItemNode );
        listNode.visible = false; // close the list, do this before changing property value, in case it's expensive
        display.removeInputListener( clickToDismissListener ); // remove the click-to-dismiss listener
        event.abort(); // prevent nodes (eg, controls) behind the list from receiving the event
        property.value = selectedItemNode.item.value; // set the property

        selectedItemNode.endEvent();
      }
    };

    // hide the list of combo box items
    var closePopup = function() {
      self.startEvent( 'user', 'popupHidden' );
      display.removeInputListener( clickToDismissListener );
      listNode.visible = false;
      self.endEvent();
    };

    // button, will be set to correct value when property observer is registered
    var buttonNode = new ButtonNode( new ComboBoxItemNode( items[ 0 ], itemWidth, itemHeight, options.itemXMargin, {
      tandem: options.tandem.createTandem( 'buttonNode', { enabled: false } ),
      a11yButtonLabel: options.a11yButtonLabel
    } ), options );
    self.addChild( buttonNode );

    // populate list with items
    items.forEach( function( item, index ) {
      var itemNodeOptions = _.extend( {
        left: options.buttonXMargin,
        top: options.listYMargin + ( index * itemHeight ),
        cursor: 'pointer',
        inputListeners: [ itemListener ]
      }, item.options );

      // For 'phet-io' brand, the tandems for items must be provided.  For other brands, the tandems are not required
      // and are filled in with substitutes so the tandems are still defined.
      if ( Tandem.validationEnabled() ) {
        assert && assert( itemNodeOptions.tandemName, 'For instrumented ComboBoxes, ItemNodes must have a tandemName' );
      }
      itemNodeOptions.tandem = options.tandem.createTandem( itemNodeOptions.tandemName || 'comboBoxItemNode' );

      // Create the list item node itself
      var comboboxItem = new ComboBoxItemNode( item, itemWidth, itemHeight, options.itemXMargin, itemNodeOptions );

      // a11y - select the property and close on a click event from assistive technology, must be removed in disposal
      // of combobox item
      comboboxItem.a11yClickListener = comboboxItem.itemWrapper.addAccessibleInputListener( {
        click: function() {
          property.value = item.value;
          closePopup();
          buttonNode.focus();  
        }
      } );

      listNode.addChild( comboboxItem );
    } );

    //TODO handle scale and rotation
    // Handles the coordinate transform required to make the list pop up near the button.
    var moveList = function() {
      var pButtonGlobal;
      var pButtonLocal;
      if ( options.listPosition === 'above' ) {
        pButtonGlobal = self.localToGlobalPoint( new Vector2( buttonNode.left, buttonNode.top ) );
        pButtonLocal = listParent.globalToLocalPoint( pButtonGlobal );
        listNode.left = pButtonLocal.x;
        listNode.bottom = pButtonLocal.y;
      }
      else {
        pButtonGlobal = self.localToGlobalPoint( new Vector2( buttonNode.left, buttonNode.bottom ) );
        pButtonLocal = listParent.globalToLocalPoint( pButtonGlobal );
        listNode.left = pButtonLocal.x;
        listNode.top = pButtonLocal.y;
      }
    };

    /**
     * Because clickToDismissListener is added to the scene, it receives the 'down' event that
     * buttonNode received to register the listener. This is because scenery propagates events
     * up the event trail, and the scene is further up the trail than the button.  This flag
     * is used to ignore the first 'down' event, which is the one that the button received.
     * If we don't do this, then we never see the list because it is immediately popped down.
     * This behavior is may change, and is being discussed in scenery#58.
     */
    var enableClickToDismissListener;
    var display; // store the display that clickToDismissListener is added to, because the scene may change, see sun#14

    // listener for 'click outside to dismiss'
    var clickToDismissListener = {
      down: function() {
        if ( enableClickToDismissListener ) {
          closePopup();
        }
        else {
          enableClickToDismissListener = true;
        }
      }
    };

    // @private {ComboboxItemNode} - tracks which item node has focus to make it easy to focus next/previous item
    // after keydown
    this.focusedItem = null;
    var handleKeyDown = listNode.addAccessibleInputListener( {
      keydown: function( event ) { 
        if ( event.keyCode === KeyboardUtil.KEY_ESCAPE ) {
          closePopup();
          buttonNode.focus();
        }
        else if ( event.keyCode === KeyboardUtil.KEY_DOWN_ARROW || event.keyCode === KeyboardUtil.KEY_UP_ARROW ) {
          var direction = event.keyCode === KeyboardUtil.KEY_DOWN_ARROW ? 1 : -1; 

          // get the next/previous item in the list and focus it
          for ( var i = 0; i < listNode.children.length; i++ ) {
            if ( self.focusedItem === listNode.children[ i ] ) {
              var nextItem = listNode.children[ i + direction ];
              if ( nextItem ) {
                self.focusedItem = nextItem;
                self.focusedItem.a11yFocusButton();
                break;
              }
            }
          }
        }
        else if ( event.keyCode === KeyboardUtil.KEY_TAB ) {
          closePopup();
        }
      }
    } );

    // button interactivity
    buttonNode.cursor = 'pointer';

    // open the popup containing the list of items
    var openPopup = function() {
      if ( !listNode.visible ) {
        self.startEvent( 'user', 'popupShown' );

        moveList();
        listNode.moveToFront();
        listNode.visible = true;
        enableClickToDismissListener = false;
        display = self.getUniqueTrail().rootNode().getRootedDisplays()[ 0 ];
        display.addInputListener( clickToDismissListener );

        self.endEvent();
      }
    };
    buttonNode.addInputListener( { down: openPopup } );
    buttonNode.a11yListener = buttonNode.addAccessibleInputListener( {
      click: function() {
        if ( listNode.visible ) {
          closePopup();
          buttonNode.focus();
        }
        else {
          openPopup();

          // focus the selected item
          for ( var i = 0; i < listNode.children.length; i++ ) {
            if ( property.value === listNode.children[ i ].item.value ) {
              self.focusedItem = listNode.children[ i ];
              self.focusedItem.a11yFocusButton();
            }
          }
        }
      },
      keydown: function( event ) {
        if ( listNode.visible ) {
          if ( event.keyCode === KeyboardUtil.KEY_ESCAPE ) {
            closePopup();
          }
        }
      }
    } );

    // layout
    if ( options.labelNode ) {
      buttonNode.left = options.labelNode.right + options.labelXSpacing;
      buttonNode.centerY = options.labelNode.centerY;
    }

    // when property changes, update button
    var propertyObserver = function( value ) {
      var item = _.find( items, function( item ) {
        return item.value === value;
      } );
      buttonNode.setItemNode( new ComboBoxItemNode( item, itemWidth, itemHeight, options.itemXMargin, {
        tandem: options.tandem.createTandem( 'buttonNode', { enabled: false } ),
        a11yLabel: item.options.a11yLabel
      } ) );
    };
    property.link( propertyObserver );

    this.mutate( options );

    // enable/disable the combo box
    var enabledObserver = function( enabled ) {
      self.pickable = enabled;
      self.opacity = enabled ? 1.0 : options.disabledOpacity;
    };
    this.enabledProperty.link( enabledObserver );

    // @private called by dispose
    this.disposeComboBox = function() {
      self.enabledProperty.unlink( enabledObserver );

      // remove a11y listeners
      listNode.removeAccessibleInputListener( handleKeyDown );

      // Unregister itemNode tandems as well
      for ( var i = 0; i < listNode.children.length; i++ ) {
        listNode.children[ i ].dispose();
      }
      buttonNode.dispose();
      property.unlink( propertyObserver );
    };
  }

  sun.register( 'ComboBox', ComboBox );

  inherit( Node, ComboBox, {

    // @public - Provide dispose() on the prototype for ease of subclassing.
    dispose: function() {
      this.disposeComboBox();
      Node.prototype.dispose.call( this );
    },

    // @public
    setEnabled: function( enabled ) { this.enabledProperty.value = enabled; },
    set enabled( value ) { this.setEnabled( value ); },

    // @public
    getEnabled: function() { return this.enabledProperty.value; },
    get enabled() { return this.getEnabled(); }
  } );

  /**
   * Creates a combo box item.
   * This exists primarily to document the structure of an item.
   * @param {Node} node
   * @param {*} value
   * @param {Object} [options] For PhET-iO instrumented simulations, the following must be supplied:
   *                             tandemName: {string} - the suffix applied to button tandems
   *                           No other options are supported.
   * @returns {object}
   * @public
   */
  ComboBox.createItem = function( node, value, options ) {
    return { node: node, value: value, options: options };
  };

  /**
   * The button that is clicked to show the list of items.
   * @param {Node} itemNode
   * @param {Object} [options]
   * @constructor
   */
  function ButtonNode( itemNode, options ) {

    options = _.extend( {
      tandem: Tandem.required, // For PhET-iO instrumented simulations, this must be supplied

      // these options are passed in from ComboBox options
      listPosition: 'below',
      buttonFill: 'white',
      buttonStroke: 'black',
      buttonLineWidth: 1,
      buttonCornerRadius: 8,
      buttonXMargin: 10,
      buttonYMargin: 4,

      // a11y
      a11yButtonLabel: '' // {string} accessible label for the button
    }, options );

    Node.call( this );

    // up or down arrow
    var arrow = new Path( null, {
      fill: 'black',
      tandem: options.tandem.createTandem( 'arrow' )
    } );
    var arrowWidth = 0.5 * itemNode.height;
    var arrowHeight = arrowWidth * Math.sqrt( 3 ) / 2; // height of equilateral triangle
    if ( options.listPosition === 'above' ) {
      arrow.shape = new Shape().moveTo( 0, arrowHeight ).lineTo( arrowWidth / 2, 0 ).lineTo( arrowWidth, arrowHeight ).close(); // up arrow
    }
    else {
      arrow.shape = new Shape().moveTo( 0, 0 ).lineTo( arrowWidth, 0 ).lineTo( arrowWidth / 2, arrowHeight ).close(); // down arrow
    }

    // button background
    var width = itemNode.width + ( 4 * options.buttonXMargin ) + arrow.width;
    var height = itemNode.height + ( 2 * options.buttonYMargin );
    var background = new Rectangle( 0, 0, width, height, {
      cornerRadius: options.buttonCornerRadius,
      fill: options.buttonFill,
      stroke: options.buttonStroke,
      lineWidth: options.buttonLineWidth
    } );

    // vertical separator to left of arrow
    var separator = new Line( 0, 0, 0, height, {
      stroke: 'black',
      lineWidth: options.buttonLineWidth,
      tandem: options.tandem.createTandem( 'separator' )
    } );

    // parent for the selected item node
    var selectedItemParent = new Node( {
      tandem: options.tandem.createTandem( 'selectedItemParent' )
    } );

    // rendering order
    this.addChild( background );
    this.addChild( arrow );
    this.addChild( separator );
    this.addChild( selectedItemParent );

    // @private
    var self = this;
    this.setItemNode = function( itemNode ) {
      // Dispose any existing item, see https://github.com/phetsims/sun/issues/299
      while ( selectedItemParent.children.length ) {
        var lastNode = selectedItemParent.children[ 0 ];
        selectedItemParent.removeChild( lastNode );
        lastNode.dispose();
      }
      selectedItemParent.addChild( itemNode );
      itemNode.left = options.buttonXMargin;
      itemNode.top = options.buttonYMargin;

      itemNode.a11yShowItem( false );

      self.accessibleDescription = itemNode.a11yLabel + ', selected';
    };
    this.setItemNode( itemNode );

    // layout
    separator.left = itemNode.right + options.buttonXMargin;
    separator.top = background.top;
    arrow.left = separator.right + options.buttonXMargin;
    arrow.centerY = background.centerY;

    // a11y
    this.tagName = 'button';
    this.accessibleLabel = options.a11yButtonLabel;

    // the button's description aria-describes this button, so it is read every time it receives focus
    this.parentContainerTagName = 'div';
    this.ariaDescribedByNode = self;
    this.ariaDescriptionContent = 'DESCRIPTION';

    // signify to AT that this button opens a menu
    this.setAccessibleAttribute( 'aria-haspopup', true );

    this.disposeButtonNode = function() {
      separator.dispose();
      arrow.dispose();
      selectedItemParent.dispose();
      options.tandem.createTandem( 'separator' ).removeInstance( separator );
      options.tandem.createTandem( 'arrow' ).removeInstance( arrow );
      options.tandem.createTandem( 'selectedItemParent' ).removeInstance( selectedItemParent );
      itemNode.dispose();

      // dispose a11y
      self.removeAccessibleInputListener( self.a11yListener );
    };
  }

  sun.register( 'ComboBox.ButtonNode', ButtonNode );

  inherit( Node, ButtonNode, {
    dispose: function() {
      this.disposeButtonNode();
      Node.prototype.dispose.call( this );
    }
  } );


  /**
   * A wrapper around the combo box item, adds margins, etc.
   * @param {Object} item - see ComboBox.createItem
   * @param {number} width
   * @param {number} height
   * @param {number} xMargin
   * @param {Object} [options]
   * @constructor
   * @private
   */
  function ComboBoxItemNode( item, width, height, xMargin, options ) {
    // @private {Node} - Holds our item.node, and positions it in the correct location. We don't want to mutate the
    //                   item's node itself.
    this.itemWrapper = new Node( {
      children: [ item.node ],
      pickable: false,
      x: xMargin,
      centerY: height / 2,

      tagName: 'button',
      ariaRole: 'menuitem'
    } );

    options = _.extend( {
      tandem: Tandem.required,
      phetioType: ComboBoxItemNodeIO,
      children: [ this.itemWrapper ],

      // a11y
      tagName: 'li',
      // tagName: 'button',
      // ariaRole: 'menuitem'
      ariaRole: 'none',

      // label for the button clickable item
      a11yLabel: ''
    }, options );

    this.item = item;

    this.a11yLabel = options.a11yLabel;

    // @private {null|function} - listener called when button clicked with AT
    this.a11yClickListener = null;

    Rectangle.call( this, 0, 0, width, height, options );

    // the highlight wraps around the entire item rectangle
    this.itemWrapper.focusHighlight = Shape.bounds( this.itemWrapper.parentToLocalBounds( this.localBounds ) );
    this.itemWrapper.accessibleLabel = options.a11yLabel;
  }

  sun.register( 'ComboBox.ItemNode', ComboBoxItemNode );

  inherit( Rectangle, ComboBoxItemNode, {
    /**
     * Disposes the item.
     * @public
     */
    dispose: function() {

      // the item in the button will not have a listener
      this.a11yClickListener && this.itemWrapper.removeAccessibleInputListener( this.a11yClickListener );
      this.itemWrapper.dispose();

      Rectangle.prototype.dispose.call( this );
    },

    a11yShowItem: function( visible ) {
      this.itemWrapper.tagName = visible ? 'button' : null;
      this.tagName = visible ? 'li' : null;
    },

    a11yFocusButton: function() {
      this.itemWrapper.focus();
    }    
  } );

  return ComboBox;
} );