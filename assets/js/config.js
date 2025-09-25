/**
 * Sistema de Configuração Centralizada
 * Carrega dados da empresa do config.json e aplica aos elementos HTML
 */

class ConfigManager {
    constructor() {
        this.config = null;
        this.selectors = {
            // Nome da empresa
            companyName: '[data-config="empresa.nome"]',
            companyNameFull: '[data-config="empresa.razaoSocial"]',
            
            // Contatos
            email: '[data-config="contato.email"]',
            emailLink: '[data-config="contato.email-link"]',
            telefone: '[data-config="contato.telefone"]',
            whatsapp: '[data-config="contato.whatsapp"]',
            whatsappLink: '[data-config="contato.whatsapp-link"]',
            
            // Endereço
            endereco: '[data-config="endereco.completo"]',
            enderecoTexto: '[data-config="endereco.texto"]',
            
            // Branding
            logo: '[data-config="branding.logo"]',
            logoAlt: '[data-config="branding.logo-alt"]',
            ano: '[data-config="branding.ano"]',
            
            // Documentos
            cnpj: '[data-config="empresa.cnpj"]',
            ie: '[data-config="empresa.inscricaoEstadual"]'
        };
    }

    /**
     * Inicializa o sistema de configuração
     */
    async init() {
        try {
            await this.loadConfig();
            this.applyConfig();
            console.log('✅ Configurações carregadas e aplicadas com sucesso');
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
            this.applyFallbackConfig();
        }
    }

    /**
     * Carrega o arquivo de configuração
     */
    async loadConfig() {
        const response = await fetch('config.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        this.config = await response.json();
    }

    /**
     * Aplica as configurações aos elementos HTML
     */
    applyConfig() {
        if (!this.config) return;

        // Nome da empresa
        this.updateElements(this.selectors.companyName, this.config.empresa.nome);
        this.updateElements(this.selectors.companyNameFull, this.config.empresa.razaoSocial);

        // Contatos
        this.updateElements(this.selectors.email, this.config.contato.email);
        this.updateElements(this.selectors.telefone, this.config.contato.telefone);
        
        // Links de contato
        this.updateEmailLinks(this.selectors.emailLink, this.config.contato.email);
        this.updateWhatsAppLinks(this.selectors.whatsappLink, this.config.contato.whatsapp);

        // Endereço
        this.updateElements(this.selectors.endereco, this.config.endereco.enderecoCompleto, true);
        this.updateElements(this.selectors.enderecoTexto, 
            `${this.config.endereco.rua}, ${this.config.endereco.bairro}, ${this.config.endereco.cidade}, ${this.config.endereco.estado} - CEP ${this.config.endereco.cep}`
        );

        // Branding
        this.updateLogos(this.selectors.logo, this.config.branding.logoPath, this.config.empresa.nome);
        this.updateElements(this.selectors.ano, this.config.branding.anoFundacao);

        // Documentos
        this.updateElements(this.selectors.cnpj, this.config.empresa.cnpj);
        this.updateElements(this.selectors.ie, this.config.empresa.inscricaoEstadual);

        // Atualizar variáveis JavaScript globais (para compatibilidade com códigos existentes)
        if (window.WHATSAPP_NUMBER !== undefined) {
            window.WHATSAPP_NUMBER = this.config.contato.whatsapp;
        }
    }

    /**
     * Atualiza elementos com o texto especificado
     */
    updateElements(selector, text, isHTML = false) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (isHTML) {
                element.innerHTML = text;
            } else {
                element.textContent = text;
            }
        });
    }

    /**
     * Atualiza links de email
     */
    updateEmailLinks(selector, email) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.href = `mailto:${email}`;
            if (!element.textContent || element.textContent === '#') {
                element.textContent = email;
            }
        });
    }

    /**
     * Atualiza links do WhatsApp
     */
    updateWhatsAppLinks(selector, whatsappNumber) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            const message = element.dataset.message || 'Olá! Gostaria de mais informações.';
            element.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        });
    }

    /**
     * Atualiza logos
     */
    updateLogos(selector, logoPath, altText) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.src = logoPath;
            element.alt = `Logo da ${altText}`;
        });
    }

    /**
     * Aplica configurações de fallback caso o carregamento falhe
     */
    applyFallbackConfig() {
        console.warn('⚠️ Usando configurações de fallback');
        // Mantém os valores hardcoded como fallback
    }

    /**
     * Retorna a configuração atual
     */
    getConfig() {
        return this.config;
    }

    /**
     * Atualiza uma configuração específica (para uso futuro)
     */
    updateConfig(path, value) {
        if (!this.config) return false;
        
        const keys = path.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) return false;
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        this.applyConfig();
        return true;
    }
}

// Inicializar o sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.configManager = new ConfigManager();
    window.configManager.init();
});

// Exportar para uso em outros scripts (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}