import { IWebPageRenderer, WebPageRenderer } from "./web-page-renderer";
import { ITemplateWebServer, TemplateWebServer } from "./template-web-server";

declare const document: any;

/**
 * Interface to the template renderer.
 * This component is responsible for pretty much everything, coordinates inflating a template, starting a web server, starting Nightmare
 * navigating to the web page and then capturing the web page to a PNG or PDF.
 */
export interface ITemplateRenderer {

    /**
     * Get the URL to access the web-sever.
     */
    getUrl(): string;

    /**
     * Start the template renderer.
     * For performance reasons the template render can be reused to render multiple web pages.
     */
    /*async*/ start (): Promise<void>;

    /**
     * Finish the template renderer.
     */
    /*async*/ end (): Promise<void>;

    /**
     * Load a template render for rendering.
     * 
     * @param templatePath The path to the template.
     */
    /*async*/ loadTemplate(data: any, templatePath: string): Promise<void>;

    /**
     * Unload current template when we are done.
     */
    /*async*/ unloadTemplate(): Promise<void>;

    /**
     * Render the current template to an image.
     */
    /*async*/ renderImage (outputFilePath: string): Promise<void>;

    //TODO: Add PDF rendering here.
}

/**
 * This component is responsible for pretty much everything, coordinates inflating a template, starting a web server, starting Nightmare
 * navigating to the web page and then capturing the web page to a PNG or PDF.
 */
export class TemplateRenderer implements ITemplateRenderer {

    /**
     * Renders the web page.
     */
    private webPageRenderer: IWebPageRenderer | null = null;

    /**
     * Hosts the templated web page to be rendered.
     */
    private templateWebServer: ITemplateWebServer | null = null;

    /**
     * Get the URL to access the web-sever.
     */
    getUrl (): string {
        return this.templateWebServer!.getUrl();
    }

    /**
     * Start the template renderer.
     * For performance reasons the template render can be reused to render multiple web pages.
     */
    async start (): Promise<void> {
        this.webPageRenderer = new WebPageRenderer();
        await this.webPageRenderer.start();
    }

    /**
     * Finish the template renderer.
     */
    async end (): Promise<void> {
        await this.unloadTemplate();

        if (this.webPageRenderer) {
            await this.webPageRenderer.end();
            this.webPageRenderer = null;
        }
    }

    /**
     * Load a template render for rendering.
     * 
     * @param templatePath The path to the template.
     */
    async loadTemplate(data: any, templatePath: string): Promise<void> {
        this.unloadTemplate();

        this.templateWebServer = new TemplateWebServer();
        await this.templateWebServer.start(data, templatePath);
    }

    /**
     * Unload current template when we are done.
     */
    async unloadTemplate(): Promise<void> {
        if (this.templateWebServer) {
            await this.templateWebServer.end();
            this.templateWebServer = null;
        }
    }

    /**
     * Render the current template to an image.
     */
    async renderImage (outputFilePath: string): Promise<void> {
        if (!this.webPageRenderer) {
            throw new Error("TemplateRenderer is not started, please call 'start' to initiate.");
        }

        if (!this.templateWebServer) {
            throw new Error("TemplateRenderer: No template is loaded, please call 'loadTemplate'.");
        }

        await this.webPageRenderer.renderImage(this.templateWebServer.getUrl(), outputFilePath, this.templateWebServer.getRootSelector());
    }
}