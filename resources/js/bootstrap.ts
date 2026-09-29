import axios from 'axios';
import { route as ziggyRoute } from 'ziggy-js';

declare global {
    interface Window {
        axios: typeof axios;
        Ziggy?: any;
        route?: any;
    }
    const route: any;
}

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const safeRoute = (name?: string, params?: any, absolute?: boolean, customConfig?: any) => {
    const config = customConfig || window.Ziggy;
    if (config && name) {
        try {
            return (ziggyRoute as any)(name, params, absolute, config);
        } catch (e) {
            // Silently fall back to route map
        }
    }

    if (!name) return '';

    const routeMap: Record<string, string> = {
        'dashboard.redirect': '/',
        'login': '/login',
        'login.post': '/login',
        'logout': '/logout',
        'profile.switch': '/switch-profile',
        'quick-search': '/api/quick-search',
        'sme.terminal': '/sme/terminal',
        'sme.consultar': '/sme/consultar',
        'sme.intercetar': '/sme/intercetar',
        'magistratura.index': '/magistratura',
        'magistratura.mandados.emitir': '/magistratura/mandados',
        'ocorrencias.index': '/ocorrencias',
        'ocorrencias.create': '/ocorrencias/criar',
        'ocorrencias.store': '/ocorrencias',
        'processos.index': '/processos',
        'processos.instaurar': '/processos/instaurar',
        'detidos.index': '/detidos',
        'detidos.store': '/detidos',
        'laboratorio.index': '/laboratorio',
        'laboratorio.store': '/laboratorio',
        'estatisticas.index': '/estatisticas',
        'auditoria.index': '/auditoria',
        'auditoria.verificar': '/auditoria/verificar-cadeia',
    };

    if (routeMap[name]) {
        return routeMap[name];
    }

    if (params && typeof params === 'string') {
        return `/${name.replace(/\./g, '/')}/${params}`;
    }

    return `/${name.replace(/\./g, '/')}`;
};

if (typeof window.route === 'undefined') {
    window.route = safeRoute;
}
(globalThis as any).route = window.route || safeRoute;

export { safeRoute as route };
