import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { expectRedux } from 'expect-redux';

Enzyme.configure({ adapter: new Adapter() });
expectRedux.configure({ betterErrorMessagesTimeout: 100 });
