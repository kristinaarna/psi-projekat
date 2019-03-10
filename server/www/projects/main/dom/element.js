'use strict';

/*
  Element is an abstract class. It represents base class
  for element wrappers. All classes that represent HTML
  elements should be extended from this class.
*/

class Element extends O.EventEmitter{
  constructor(parent=null){
    super();

    let parentElem;

    if(parent instanceof Element){
      parentElem = parent.elem;
    }else{
      parentElem = parent;
      parent = null;
    }
    
    this.parent = parent;
    this.parentElem = parentElem;

    if(this.parentElem !== null)
      this.elem = O.ce(this.parentElem, this.getTag(), this.getCss());
    else
      this.elem = null;
  }

  // Add event listener wrapper
  ael(type, func){
    O.ael(this.elem, type, evt => {
      evt.preventDefault();
      evt.stopPropagation();

      func(evt);
    });
  }

  clear(){
    for(const child of this.children)
      child.remove();
  }

  reset(){ return this.clear(); }
  purge(){ return this.clear(); }

  get children(){
    return this.elem.children;
  }

  getText(){
    return this.elem.textContent;
  }

  setText(text){
    this.elem.textContent = text;
  }

  getTag(){ return this.tag(); }

  getCss(){
    const set = new Set();
    O.proto(this).getCssRec(set);
    return Array.from(set).join(' ');
  }

  getCssRec(set){
    if(this.css === Element.prototype.css) return;
    
    set.add(this.css());
    O.proto(this).getCssRec(set);
  }

  tag(){ O.virtual('tag'); } // Tag name
  css(){ O.virtual('css'); } // CSS style
};

class Div extends Element{
  constructor(parent){
    super(parent);
  }

  tag(){ return 'div'; }
};

class Text extends Element{
  constructor(parent, text=''){
    super(parent);
    this.setText(text);
  }

  css(){ return 'text'; }
};

class Span extends Text{
  constructor(parent, text){
    super(parent, text);
  }

  tag(){ return 'span'; }
};

class Link extends Text{
  constructor(parent, text, url='javascript:void(0)'){
    super(parent);
    this.href = url;
  }

  tag(){ return 'a'; }
};

class Heading extends Text{
  constructor(parent, text, size=1){
    Heading[O.static] = size;
    super(parent, text);
    this.headingSize = size;
  }

  tag(){
    const size = O.has(this, 'headingSize') ? this.headingSize : Heading[O.static];
    return `h${size}`;
  }

  css(){ return 'heading'; }
};

class Title extends Heading{
  css(){ return 'title'; }
};

class Rectangle extends Div{
  css(){ return 'rect'; }
};

class Region extends Rectangle{
  css(){ return 'region'; }
};

class Button extends Span{
  constructor(parent, text){
    super(parent, text);
    this.aels();
  }

  aels(){
    this.ael('click', evt => {
      this.emit('click', evt);
    });
  }

  css(){ return 'btn'; }
};

Element.Div = Div;
Element.Text = Text;
Element.Span = Span;
Element.Link = Link;
Element.Heading = Heading;
Element.Title = Title;
Element.Rectangle = Rectangle;
Element.Region = Region;
Element.Button = Button;

module.exports = Element;