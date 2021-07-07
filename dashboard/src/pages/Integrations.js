import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import Fade from 'react-reveal/Fade';
import WebHookBox from '../components/webHooks/WebHookBox';
import ZapierBox from '../components/zapier/ZapierBox';
import { logEvent } from '../analytics';
import { SHOULD_LOG_ANALYTICS } from '../config';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';
import getParentRoute from '../utils/getParentRoute';
import MSTeamsBox from '../components/webHooks/MSTeamsBox';
import SlackBox from '../components/webHooks/SlackBox';
import IncomingRequestBox from '../components/webHooks/IncomingRequestBox';

class Integrations extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    componentDidMount() {
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('PAGE VIEW: DASHBOARD > PROJECT > SETTINGS > INTEGRATION');
        }
    }

    render() {
        const {
            location: { pathname },
        } = this.props;

        return (
            <Fade>
                <BreadCrumbItem
                    route={getParentRoute(pathname)}
                    name="Project Settings"
                />
                <BreadCrumbItem route={pathname} name="Integrations" />
                <WebHookBox />
                <IncomingRequestBox />
                <MSTeamsBox />
                <SlackBox />
                <ZapierBox />
            </Fade>
        );
    }
}

Integrations.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
};

Integrations.displayName = 'Integrations';

export default Integrations;
