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
    let match = false;

    const panel = index ? this.find('InnerPicker').at(index) : this;
    panel.find('td').forEach(td => {
      if (
        td.text() === String(text) &&
        td.props().className.includes('-in-view')
      ) {
        match = true;
        td.simulate('click');
      }
    });

    if (!match) {
      throw new Error('Cell not match in picker panel.');
    }
  },
  clearValue() {
    this.find('.rc-picker-clear-btn').simulate('click');
  },
  keyDown(which, info = {}) {
    this.find('input').simulate('keydown', { ...info, which });
  },
});
