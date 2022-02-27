// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module 'puppeteer' or its correspondin... Remove this comment to see the full error message
import puppeteer from 'puppeteer';
import utils from '../../test-utils';
import init from '../../test-init';

let browser: $TSFixMe, page: $TSFixMe;
// user credentials
const email = utils.generateRandomBusinessEmail();
const teamEmail = utils.generateRandomBusinessEmail();
const projectOwnerMail = utils.generateRandomBusinessEmail();
const password = '1234567890';
const newProjectName = 'Test';
const subProjectName = 'Trial';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Sub-Project API', () => {
    const operationTimeOut = init.timeout;

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeAll'.
    beforeAll(async (done: $TSFixMe) => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);
        const user = {
            email,
            password,
        };

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
        'should show pricing plan modal for project not on Growth plan and above',
        async (done: $TSFixMe) => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle2',
            });
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            await init.pageWaitForSelector(page, '#projectSettings');
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            await init.pageClick(page, '#projectSettings');
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            await init.pageWaitForSelector(page, '#btn_Add_SubProjects');
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            await init.pageClick(page, '#btn_Add_SubProjects');

            const pricingPlanModal = await init.pageWaitForSelector(
                page,
                '#pricingPlanModal',
                { visible: true, timeout: init.timeout }
            );

            expect(pricingPlanModal).toBeDefined();
            done();
        },
        operationTimeOut
    );
});

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Member Restriction', () => {
    const operationTimeOut = init.timeout;

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeAll'.
    beforeAll(async (done: $TSFixMe) => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);
        // user
        await init.registerUser({ email: projectOwnerMail, password }, page);
        await init.renameProject(newProjectName, page);
        await page.goto(utils.DASHBOARD_URL, {
            waitUntil: 'networkidle2',
        });
        await init.addUserToProject(
            {
                email: teamEmail,
                role: 'Member',
                subProjectName: newProjectName,
            },
            page
        );

        await init.saasLogout(page);

        done();
    });

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterAll'.
    afterAll(async (done: $TSFixMe) => {
        await browser.close();
        done();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test(
        'should show unauthorised modal to a team member who is not an admin or owner of the project',
        async (done: $TSFixMe) => {
            await init.registerAndLoggingTeamMember(
                { email: teamEmail, password },
                page
            ); // The team member has to register first before logging in.

            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle2',
            });
            await init.pageWaitForSelector(page, '#projectSettings', {
                visible: true,
                timeout: init.timeout,
            });
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            await init.pageClick(page, '#projectSettings');
            await init.pageWaitForSelector(page, '#btn_Add_SubProjects', {
                visible: true,
                timeout: init.timeout,
            });
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            await init.pageClick(page, '#btn_Add_SubProjects');
            const unauthorisedModal = await init.pageWaitForSelector(
                page,
                '#unauthorisedModal',
                { visible: true, timeout: init.timeout }
            );

            expect(unauthorisedModal).toBeDefined();
            await init.saasLogout(page);
            done();
        },
        operationTimeOut
    );

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test(
        'should show unauthorised modal to a team member who is not an admin of the project trying to perform any action subproject list',
        async (done: $TSFixMe) => {
            await init.loginUser({ email: projectOwnerMail, password }, page);

            await init.growthPlanUpgrade(page);
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle2',
            });
            // adding a subProject is only allowed on growth plan and above
            await init.addSubProject(subProjectName, page);
            await init.saasLogout(page);

            await init.loginUser({ email: teamEmail, password }, page);
            await init.pageWaitForSelector(page, '#projectSettings', {
                visible: true,
                timeout: init.timeout,
            });
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            await init.pageClick(page, '#projectSettings');
            const deleteSubProjectBtn = `#sub_project_delete_${subProjectName}`;
            await init.pageWaitForSelector(page, deleteSubProjectBtn, {
                visible: true,
                timeout: init.timeout,
            });
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
            await init.pageClick(page, deleteSubProjectBtn);
            const unauthorisedModal = await init.pageWaitForSelector(
                page,
                '#unauthorisedModal',
                { visible: true, timeout: init.timeout }
            );
            expect(unauthorisedModal).toBeDefined();

            done();
        },
        operationTimeOut
    );
});
