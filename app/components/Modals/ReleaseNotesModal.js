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
        className="modal fade slide-right"
        id="releaseNotesModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="releaseNotesModal"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header clearfix separator">
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-hidden="true"
                onClick={() => this.props.storageService.save('changelogSeen', true)}
              >
                <i className="pg-close fs-14" />
              </button>
            </div>
            <div className="modal-body">
              <div className="text-center">
                <h1>
                  <strong>Release Notes</strong>
                </h1>
              </div>
              {allReleaseNotes}
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
