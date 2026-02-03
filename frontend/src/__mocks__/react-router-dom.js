export const BrowserRouter = ({ children }) => <div>{children}</div>;
export const Routes = ({ children }) => <div>{children}</div>;
export const Route = ({ children }) => <div>{children}</div>;
export const Link = ({ children, to }) => <a href={to}>{children}</a>;
export const useParams = () => {};
export const useNavigate = () => {};
export const useLocation = () => ({ pathname: '' });