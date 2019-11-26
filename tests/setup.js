const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

Enzyme.configure({ adapter: new Adapter() });

Object.assign(Enzyme.ReactWrapper.prototype, {
  openPicker() {
    this.find('input').simulate('mousedown');
  },
  closePicker() {
    this.find('input').simulate('blur');
  },
  isOpen() {
    const openDiv = this.find('.rc-picker-dropdown').hostNodes();
    return openDiv && !openDiv.hasClass('rc-picker-dropdown-hidden');
  },
});
