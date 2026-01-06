import Overview from './pages/Overview';
import Projects from './pages/Projects';
import CredentialVault from './pages/CredentialVault';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Overview": Overview,
    "Projects": Projects,
    "CredentialVault": CredentialVault,
}

export const pagesConfig = {
    mainPage: "Overview",
    Pages: PAGES,
    Layout: __Layout,
};