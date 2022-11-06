global.requestAnimationFrame = callback => {
  global.setTimeout(callback, 0);
};

global.cancelAnimationFrame = id => {
  global.clearTimeout(id);
};

const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

Enzyme.configure({ adapter: new Adapter() });

Object.assign(Enzyme.ReactWrapper.prototype, {
  openPicker(index = 0) {
    this.find('input')
      .at(index)
      .simulate('mousedown')
      .simulate('focus');
  },
  closePicker(index = 0) {
    this.find('input')
      .at(index)
      .simulate('blur');
  },
  confirmOK() {
    this.find('.rc-picker-ok > *').simulate('click');
  },
  isOpen() {
    const openDiv = this.find('.rc-picker-dropdown').hostNodes();
    return openDiv && openDiv.length && !openDiv.hasClass('rc-picker-dropdown-hidden');
  },
  findCell(text, index = 0) {
    let matchCell;

    const table = this.find('table').at(index);

    table.find('td').forEach(td => {
      if (td.text() === String(text) && td.props().className.includes('-in-view')) {
        matchCell = td;
      }
    });
    if (!matchCell) {
      throw new Error('Cell not match in picker panel.');
    }

    return matchCell;
  },
  selectCell(text, index = 0) {
    const td = this.findCell(text, index);
    td.simulate('click');

    return td;
  },
  clickButton(type) {
    let matchBtn;
    this.find('button').forEach(btn => {
      if (btn.props().className.includes(`-header-${type}-btn`)) {
        matchBtn = btn;
      }
    });

    matchBtn.simulate('click');

    return matchBtn;
  },
  clearValue() {
    this.find('.rc-picker-clear-btn').simulate('mouseDown');
    this.find('.rc-picker-clear-btn').simulate('mouseUp');
  },
  keyDown(which, info = {}, index = 0) {
    let component = this.find('input');

    if (component.length === 0) {
      component = this.find('.rc-picker-panel');
    }

    component.at(index).simulate('keydown', { ...info, which });
  },
  inputValue(text, index = 0) {
    this.find('input')
      .at(index)
      .simulate('change', { target: { value: text } });
  },
});
