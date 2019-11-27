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
  isOpen() {
    const openDiv = this.find('.rc-picker-dropdown').hostNodes();
    return (
      openDiv &&
      openDiv.length &&
      !openDiv.hasClass('rc-picker-dropdown-hidden')
    );
  },
  selectCell(text, index = 0) {
    let matchCell;

    const panel = index ? this.find('InnerPicker').at(index) : this;
    panel.find('td').forEach(td => {
      if (
        td.text() === String(text) &&
        td.props().className.includes('-in-view')
      ) {
        matchCell = td;
        td.simulate('click');
      }
    });

    if (!matchCell) {
      throw new Error('Cell not match in picker panel.');
    }

    return matchCell;
  },
  clearValue(index = 0) {
    this.find('Picker')
      .at(index)
      .find('.rc-picker-clear-btn')
      .simulate('click');
  },
  keyDown(which, info = {}) {
    this.find('input').simulate('keydown', { ...info, which });
  },
});
