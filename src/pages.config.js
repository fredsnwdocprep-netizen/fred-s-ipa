import Overview from './pages/Overview';
import Projects from './pages/Projects';
import CredentialVault from './pages/CredentialVault';
import BuildEngine from './pages/BuildEngine';
import NewBuild from './pages/NewBuild';
import BuildDetail from './pages/BuildDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Overview": Overview,
    "Projects": Projects,
    "CredentialVault": CredentialVault,
    "BuildEngine": BuildEngine,
    "NewBuild": NewBuild,
    "BuildDetail": BuildDetail,
}

export const pagesConfig = {
    mainPage: "Overview",
    Pages: PAGES,
    Layout: __Layout,
};