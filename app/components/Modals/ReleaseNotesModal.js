import React, { Component } from 'react';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';

import GitHub from 'github-api';
import showdown from 'showdown';

@inject('storageService')
class ReleaseNotesModal extends Component {
  constructor() {
    super();
    this.state = {
      releaseNotes: []
    };
  }

  async componentDidMount() {
    this.setState({
      releaseNotes: await this.getReleaseNotes()
    });
  }

  async getReleaseNotes() {
    const gh = new GitHub();
    const repo = gh.getRepo('chronologic', 'eth-alarm-clock-dapp');
    const releases = await repo.listReleases();

    const allReleaseNotes = releases.data.map(release => {
      return {
        version: release.tag_name,
        name: release.name,
        body: release.body,
        published_at: release.published_at,
        url: release.url
      };
    });

    return allReleaseNotes;
  }

  render() {
    const { releaseNotes } = this.state;
    const converter = new showdown.Converter();

    const allReleaseNotes = [];

    for (let note of releaseNotes) {
      allReleaseNotes.push(
        <div className="release-notes-row" key={note.name}>
          <h2>{note.name}</h2>
          <p dangerouslySetInnerHTML={{ __html: converter.makeHtml(note.body) }} />
        </div>
      );
    }

    return (
      <div
        className="modal fade stick-up"
        id="releaseNotesModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="releaseNotesModal"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header clearfix text-center separator">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                <i className="pg-close fs-14" />
              </button>
              <h3 className="timenode-modal-title m-0 ">
                <strong>Release Notes</strong>
              </h3>
            </div>
            <div className="modal-body">{allReleaseNotes}</div>
            <div className="modal-footer">
              <button
                className="btn btn-primary btn-block"
                type="button"
                data-dismiss="modal"
                onClick={() => this.props.storageService.save('changelogSeen', true)}
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ReleaseNotesModal.propTypes = {
  storageService: PropTypes.any
};

export { ReleaseNotesModal };
