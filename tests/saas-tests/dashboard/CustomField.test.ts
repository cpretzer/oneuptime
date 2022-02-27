// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module 'puppeteer' or its correspondin... Remove this comment to see the full error message
import puppeteer from 'puppeteer';
import utils from '../../test-utils';
import init from '../../test-init';

require('should');
let browser: $TSFixMe, page: $TSFixMe;
// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const user = {
    email,
    password,
};
const incidentFieldText = {
        fieldName: 'textField',
        fieldType: 'text',
    },
    incidentFieldNumber = {
        fieldName: 'numField',
        fieldType: 'number',
    };

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Incident Custom Field', () => {
    const operationTimeOut = init.timeout;

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeAll'.
    beforeAll(async (done: $TSFixMe) => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);
        // user
        await init.registerUser(user, page);

        done();
    });

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterAll'.
    afterAll(async (done: $TSFixMe) => {
        await browser.close();
        done();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test(
        'should configure incident custom field in a project',
        async (done: $TSFixMe) => {
            await init.addCustomField(page, incidentFieldText, 'incident');
            await init.navigateToCustomField(page);
            const firstCustomField = await init.pageWaitForSelector(
                page,
                `#customfield_${incidentFieldText.fieldName}`,
                { visible: true, timeout: init.timeout }
            );
            expect(firstCustomField).toBeDefined();
            done();
        },
        operationTimeOut
    );

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test(
        'should update a incident custom field in a project',
        async (done: $TSFixMe) => {
            await init.navigateToCustomField(page);
            await init.pageWaitForSelector(page, '#editCustomField_0', {
                visible: true,
                timeout: init.timeout,
            });
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            await init.pageClick(page, '#editCustomField_0');
            await init.pageWaitForSelector(page, '#customFieldForm', {
                visible: true,
                timeout: init.timeout,
            });
            await init.pageClick(page, '#fieldName', { clickCount: 3 });
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
            await init.pageType(
                page,
                '#fieldName',
                incidentFieldNumber.fieldName
            );
            await init.selectDropdownValue(
                '#fieldType',
                incidentFieldNumber.fieldType,
                page
            );
            await init.pageWaitForSelector(page, '#updateCustomField', {
                visible: true,
                timeout: init.timeout,
            });
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            await init.pageClick(page, '#updateCustomField');
            await init.pageWaitForSelector(page, '#updateCustomField', {
                hidden: true,
            });

            await init.navigateToCustomField(page);
            const updatedField = await init.pageWaitForSelector(
                page,
                `#customfield_${incidentFieldNumber.fieldName}`,
                { visible: true, timeout: init.timeout }
            );
            expect(updatedField).toBeDefined();
            done();
        },
        operationTimeOut
    );

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test(
        'should delete a incident custom field in a project',
        async (done: $TSFixMe) => {
            await init.navigateToCustomField(page);
            await init.pageWaitForSelector(page, '#deleteCustomField_0', {
                visible: true,
                timeout: init.timeout,
            });
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            await init.pageClick(page, '#deleteCustomField_0');
            await init.pageWaitForSelector(page, '#deleteCustomFieldModalBtn', {
                visible: true,
                timeout: init.timeout,
            });
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            await init.pageClick(page, '#deleteCustomFieldModalBtn');
            await init.pageWaitForSelector(page, '#deleteCustomFieldModalBtn', {
                hidden: true,
            });

            await init.navigateToCustomField(page);
            const noCustomFields = await init.pageWaitForSelector(
                page,
                '#noCustomFields',
                { visible: true, timeout: init.timeout }
            );
            expect(noCustomFields).toBeDefined();

            done();
        },
        operationTimeOut
    );
});
