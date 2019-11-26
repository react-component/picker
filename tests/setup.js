const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

Enzyme.configure({ adapter: new Adapter() });

Object.assign(Enzyme.ReactWrapper.prototype, {
  openPicker() {
    this.find('input').simulate('mousedown');
    this.find('input').simulate('focus');
  },
  closePicker() {
    this.find('input').simulate('blur');
  },
  isOpen() {
    const openDiv = this.find('.rc-picker-dropdown').hostNodes();
    return (
      openDiv &&
      openDiv.length &&
      !openDiv.hasClass('rc-picker-dropdown-hidden')
    );
  },
  selectDate(date) {
    let match = false;

    this.find('td').forEach(td => {
      if (
        td.text() === String(date) &&
        td.hasClass('rc-picker-date-panel-cell-in-view')
      ) {
        match = true;
        td.simulate('click');
      }
    });

    if (!match) {
      throw new Error('Date not match in picker panel.');
    }
  },
  clearValue() {
    this.find('.rc-picker-clear-btn').simulate('click');
  },
  keyDown(which, info = {}) {
    this.find('input').simulate('keydown', { ...info, which });
  },
});
