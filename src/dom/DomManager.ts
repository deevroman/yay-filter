import { Config } from '../Config';

/**
 * Handles DOM elements on YouTube.
 */
export default class DomManager {
    /**
     * Gets the first element that matches the query.
     * @param query query
     * @param ancestor ancestor element
     */
    static getElementByQuery(query: string, ancestor: HTMLElement | null = null): HTMLElement {
        const elem = (ancestor == null ? document : ancestor).querySelector(query);
        if (elem == null) throw new Error(`Element not found: ${query}`);
        return elem as HTMLElement;
    }

    /**
     * Gets the first element that has the specific ID.
     * @param id element ID
     */
    static getElementById(id: string): HTMLElement {
        return this.getElementByQuery(`#${id}`);
    }

    /**
     * Finds the comment container from the page.
     * @return comment container element or null if it has not yet rendered
     */
    static findCommentContainer(): HTMLElement | null {
        return document.querySelector(Config.dom.selector.ytCommentContainer);
    }

    /**
     * Waits for and gets the comment container.
     * @param callback callback function
     * @param timeout timeout in milliseconds
     * @param delay polling interval in milliseconds
     */
    static withCommentContainer(callback: (elem: HTMLElement | null) => void, timeout = 30000, delay = 200): void {
        if (timeout <= 0) {
            // time limit exceeded
            callback(null);
        }

        const elem = this.findCommentContainer();
        if (elem == null) {
            // retry
            window.setTimeout(() => this.withCommentContainer(callback, timeout - delay, delay), delay);
        } else {
            callback(elem);
        }
    }

    /**
     * Finds the comment header.
     * @return comment header element or null if it has not yet rendered
     */
    static findCommentHeader(): HTMLElement | null {
        return document.querySelector(Config.dom.selector.ytCommentTitle);
    }

    /**
     * Finds the filter button container.
     * @return filter button container or null if it has not yet rendered
     */
    static findYayFilterContainer(): HTMLElement | null {
        return document.getElementById(Config.dom.id.yayFilterContainer);
    }

    /**
     * Gets the filter button container.
     * @return filter button container
     */
    static getYayFilterContainer(): HTMLElement {
        return this.getElementById(Config.dom.id.yayFilterContainer);
    }

    /**
     * Finds the filter button status.
     * @return filter button status
     */
    static findYayFilterStatus(): HTMLElement | null {
        return document.getElementById(Config.dom.id.yayFilterStatus);
    }

    /**
     * Finds the filter button info.
     * @return filter button info
     */
    static findYayFilterInfo(): HTMLElement | null {
        return document.getElementById(Config.dom.id.yayFilterInfo);
    }

    /**
     * Finds all comment threads.
     * @return list of thread containers
     */
    static findCommentThreads(): NodeListOf<HTMLElement> {
        return document.querySelectorAll(Config.dom.selector.ytCommentThread);
    }

    /**
     * Gets the thread container.
     * @return thread container element
     */
    static getCommentThreadContainer(): HTMLElement {
        return this.getElementByQuery(Config.dom.selector.ytCommentContents);
    }

    /**
     * Fetches the text content of the thread.
     * @param thread thread container
     * @return text
     */
    // FIXME: Resulting text may contain replies
    static fetchTextContent(thread: HTMLElement): string {
        const text = thread.querySelector(Config.dom.selector.ytCommentText);
        if (text == null || text.textContent == null) return '';
        return text.textContent;
    }

    /**
     * Finds the sort options from the page.
     * @return list of option containers
     */
    static findSortItems(): NodeListOf<HTMLElement> {
        return document.querySelectorAll(Config.dom.selector.ytCommentSortItems);
    }

    //--------------------------------------------------------------------------
    //    Specific HTML Element Generators
    //--------------------------------------------------------------------------

    /**
     * Creates an HTML string for the filter button.
     * @param onClick callback function on click
     * @return tuple of the container, status, and info elements
     */
    static createYayFilterContainer(onClick: (ev: Event) => void): [HTMLSpanElement, HTMLSpanElement, HTMLSpanElement] {
        const span = document.createElement('span');
        span.id = Config.dom.id.yayFilterContainer;

        const tooltip = this.createElementWithText('paper-tooltip', chrome.i18n.getMessage('filter_comments'));
        tooltip.className = 'style-scope';
        tooltip.setAttribute('role', 'tooltip');
        span.appendChild(tooltip);

        const div = document.createElement('div');

        const parser = new DOMParser();
        const svg = parser.parseFromString(Config.dom.svg.filterIcon, 'image/svg+xml');
        div.appendChild(svg.documentElement);
        div.appendChild(this.createElementWithText('span', chrome.i18n.getMessage('filter')));
        const filterStatus = document.createElement('span') as HTMLSpanElement;
        filterStatus.id = Config.dom.id.yayFilterStatus;
        div.appendChild(filterStatus);
        const filterInfo = document.createElement('span') as HTMLSpanElement;
        filterInfo.id = Config.dom.id.yayFilterInfo;
        div.appendChild(filterInfo);
        span.appendChild(div);

        div.addEventListener('click', onClick, false);
        return [span, filterStatus, filterInfo];
    }

    //--------------------------------------------------------------------------
    //    General HTML Element Generators
    //--------------------------------------------------------------------------

    /**
     * Creates a checkbox.
     * @param id element ID
     * @param checked checked
     * @param text text
     * @param onChanged on changed
     * @return tuple of input and label
     */
    static createCheckbox(
        id: string,
        checked: boolean,
        text: string,
        onChanged: (ev: Event) => void,
    ): [HTMLInputElement, HTMLLabelElement] {
        const checkbox = document.createElement('input') as HTMLInputElement;
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.checked = checked;
        checkbox.addEventListener('change', onChanged);

        const label = document.createElement('label') as HTMLLabelElement;
        label.htmlFor = checkbox.id;
        label.appendChild(document.createTextNode(text));

        return [checkbox, label];
    }

    /**
     * Creates an element with text.
     * @param tagName tag name
     * @param text text
     * @return new element
     */
    static createElementWithText(tagName: string, text: string): HTMLElement {
        const ret = document.createElement(tagName) as HTMLElement;
        ret.appendChild(document.createTextNode(text));
        return ret;
    }

    /**
     * Creates an anchor element.
     * @param href href
     * @param text text
     * @param target target
     * @return anchor element
     */
    static createAnchor(href: string, text: string, target = '_blank'): HTMLAnchorElement {
        const anchor = document.createElement('a') as HTMLAnchorElement;
        anchor.href = href;
        anchor.target = target;
        anchor.appendChild(document.createTextNode(text));
        return anchor;
    }

    /**
     * Creates an option element.
     * @param value value
     * @param text text
     * @return option element
     */
    static createOption(value: string, text: string): HTMLOptionElement {
        const elem = this.createElementWithText('option', text) as HTMLOptionElement;
        elem.value = value;
        return elem;
    }

    /**
     * Creates an input-button element.
     * @param label label
     * @param title title
     * @param onClick on click
     * @return input element
     */
    static createButton(label: string, title: string, onClick: (ev: Event) => void): HTMLInputElement {
        const elem = document.createElement('input') as HTMLInputElement;
        elem.type = 'button';
        elem.value = label;
        elem.title = title;
        elem.addEventListener('click', onClick);
        return elem;
    }

    /**
     * Creates a submit button.
     * @param label label
     * @param title title
     * @return input element
     */
    static createSubmit(label: string, title: string): HTMLInputElement {
        const elem = document.createElement('input') as HTMLInputElement;
        elem.type = 'submit';
        elem.value = label;
        elem.title = title;
        return elem;
    }

    /**
     * Creates a form element.
     * @param onSubmit on submit
     * @return form element
     */
    static createForm(onSubmit: () => void): HTMLFormElement {
        const elem = document.createElement('form') as HTMLFormElement;
        elem.addEventListener('submit', (ev: Event) => {
            ev.preventDefault();
            onSubmit();
            return false;
        });
        return elem;
    }

    //--------------------------------------------------------------------------
    //    Utilities
    //--------------------------------------------------------------------------

    /**
     * Updates the text node in the given element.
     * @param elem HTML element
     * @param text new text
     */
    static replaceText(elem: HTMLElement, text: string): void {
        if (elem.childNodes.length == 0) {
            elem.appendChild(document.createTextNode(text));
        } else {
            elem.childNodes[0].nodeValue = text;
        }
    }

    /**
     * Clears all child elements.
     * @param element parent element
     */
    static clearChildElements(element: HTMLElement): void {
        while (element.lastChild) element.removeChild(element.lastChild);
    }
}
