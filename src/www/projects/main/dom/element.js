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

  br(num){ return O.ceBr(this.elem, num); }

  get children(){
    return Array.from(this.elem.children);
  }

  getVal(){
    return this.elem.textContent;
  }

  setVal(text){
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
    this.setVal(text);
  }

  css(){ return 'text'; }
};

class Span extends Text{
  tag(){ return 'span'; }
};

class Input extends Element{
  constructor(parent, placeholder=null){
    super(parent);

    if(placeholder !== null)
      this.elem.placeholder = placeholder;
  }

  getVal(){
    return this.elem.value;
  }

  setVal(val){
    this.elem.value = val;
  }

  tag(){ return 'input'; }
  css(){ return 'input'; }
};

class InputText extends Input{
  constructor(parent, placeholder){
    super(parent, placeholder);
    this.elem.type = 'text';
  }
};

class InputPass extends Input{
  constructor(parent, placeholder){
    super(parent, placeholder);
    this.elem.type = 'password';
  }
};

class InputTextarea extends Input{
  constructor(parent, placeholder, val=''){
    super(parent, placeholder);
    this.setVal(val);
  }

  tag(){ return 'textarea'; }
  css(){ return 'textarea'; }
};

class InputDropdown extends Input{
  constructor(parent, opts=[], selected=null){
    super(parent);

    for(const [label, desc] of opts)
      this.addOpt(label, desc, label === selected);
  }

  getVal(){
    O.noimpl('getVal');
  }

  setVal(val){
    O.noimpl('setVal');
  }

  addOpt(label, desc, selected=0){
    const opt = O.ce(this.elem, 'option');
    opt.value = label;
    O.ceText(opt, desc);
    if(selected) opt.selected = '1';
  }

  tag(){ return 'select'; }
  css(){ return 'dropdown'; }
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
Element.Input = Input;
Element.InputText = InputText;
Element.InputPass = InputPass;
Element.InputTextarea = InputTextarea;
Element.InputDropdown = InputDropdown;
Element.Link = Link;
Element.Heading = Heading;
Element.Title = Title;
Element.Rectangle = Rectangle;
Element.Region = Region;
Element.Button = Button;

module.exports = Element;