import Artifacts from './pages/Artifacts';
import AuditTrail from './pages/AuditTrail';
import BuildDetail from './pages/BuildDetail';
import BuildEngine from './pages/BuildEngine';
import CredentialVault from './pages/CredentialVault';
import InstallApp from './pages/InstallApp';
import NewBuild from './pages/NewBuild';
import Overview from './pages/Overview';
import Projects from './pages/Projects';
import Runners from './pages/Runners';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Artifacts": Artifacts,
    "AuditTrail": AuditTrail,
    "BuildDetail": BuildDetail,
    "BuildEngine": BuildEngine,
    "CredentialVault": CredentialVault,
    "InstallApp": InstallApp,
    "NewBuild": NewBuild,
    "Overview": Overview,
    "Projects": Projects,
    "Runners": Runners,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Overview",
    Pages: PAGES,
    Layout: __Layout,
};