import * as React from "react";
import * as Constants from "~/common/constants";
import * as SVG from "~/common/svg";
import * as Strings from "~/common/strings";
import * as Actions from "~/common/actions";

import MiniSearch from "minisearch";

import { css } from "@emotion/react";
import { SearchDropdown } from "~/components/core/SearchDropdown";
import { dispatchCustomEvent } from "~/common/custom-events";
import { SlatePreviewRow } from "~/components/core/SlatePreviewBlock";

const STYLES_ICON_CIRCLE = css`
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background-color: ${Constants.system.foreground};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const STYLES_CONTAINER = css`
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: ${Constants.system.white};
  box-shadow: 0 0 60px 8px rgba(0, 0, 0, 0.03);

  @media (max-width: ${Constants.sizes.mobile}px) {
    max-width: 95vw;
    padding: 20px;
  }
`;

const STYLES_MODAL = css`
  position: relative;
  width: 95vw;
  max-width: 640px;
  box-sizing: border-box;
  height: 60vh;
  max-height: 480px;
`;

const STYLES_SEARCH_DROPDOWN = {
  // height: "calc(100% - 16px)",
  // overflowY: "scroll",
};

const STYLES_USER_ENTRY_CONTAINER = css`
  display: grid;
  grid-template-columns: repeat(3, auto) 1fr;
  grid-column-gap: 16px;
  align-items: center;
`;

const STYLES_PROFILE_IMAGE = css`
  background-color: ${Constants.system.foreground};
  background-size: cover;
  background-position: 50% 50%;
  height: 24px;
  width: 24px;
  border-radius: 50%;
`;

const UserEntry = ({ item }) => {
  return (
    <div css={STYLES_ENTRY}>
      <div css={STYLES_USER_ENTRY_CONTAINER}>
        <div style={{ backgroundImage: `url(${item.data.photo})` }} css={STYLES_PROFILE_IMAGE} />
        {item.data.name ? <div css={STYLES_TITLE}>{item.data.name}</div> : null}
        <div css={STYLES_TITLE}>@{item.username}</div>
      </div>
    </div>
  );
};

const STYLES_ENTRY = css`
  padding: 8px 0px;
`;

const STYLES_SLATE_ENTRY_CONTAINER = css`
  display: grid;
  grid-template-columns: repeat(3, auto) 1fr;
  grid-column-gap: 16px;
  align-items: center;
`;

const STYLES_SLATE_IMAGES_CONTAINER = css`
  margin-top: 8px;
  margin-left: 40px;
`;

const STYLES_TITLE = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SlateEntry = ({ item }) => {
  return (
    <div css={STYLES_ENTRY}>
      <div css={STYLES_SLATE_ENTRY_CONTAINER}>
        <div css={STYLES_ICON_CIRCLE}>
          <SVG.Slate height="16px" />
        </div>
        <div css={STYLES_TITLE}>{item.data.name}</div>
        {item.owner && item.owner.username ? (
          <div css={STYLES_TITLE}>@{item.owner.username}</div>
        ) : null}
      </div>
      {item.data.objects && item.data.objects.length ? (
        <div css={STYLES_SLATE_IMAGES_CONTAINER}>
          <SlatePreviewRow numItems={4} slate={item} small />
        </div>
      ) : null}
    </div>
  );
};

const FileEntry = ({ item }) => {
  return (
    <div css={STYLES_ENTRY}>
      <div css={STYLES_USER_ENTRY_CONTAINER}>
        <div css={STYLES_ICON_CIRCLE}>
          <SVG.Folder height="16px" />
        </div>
        <div css={STYLES_TITLE}>
          {item.data.file.title || item.data.file.name || item.data.file.file}
        </div>
        {item.data.slate && item.data.slate.owner && item.data.slate.owner.username ? (
          <div css={STYLES_TITLE}>@{item.data.slate.owner.username}</div>
        ) : null}
      </div>
      <div css={STYLES_SLATE_IMAGES_CONTAINER}>
        <SlatePreviewRow numItems={1} slate={{ data: { objects: [item.data.file] } }} small />
      </div>
    </div>
  );
};

export class SearchModal extends React.Component {
  state = {
    loading: true,
    results: [],
    inputValue: "",
    filters: { slates: true },
  };

  componentDidMount = async () => {
    await this.fillDirectory();
    // await this.fillPersonalDirectory();
    this.setState({ loading: false });
  };

  fillDirectory = async () => {
    const response = await Actions.getNetworkDirectory();
    this.miniSearch = new MiniSearch({
      fields: ["slatename", "data.name", "username", "filename"],
      storeFields: ["type", "slatename", "username", "data", "id", "slates", "owner"],
      extractField: (entry, fieldName) => {
        return fieldName.split(".").reduce((doc, key) => doc && doc[key], entry);
      },
      searchOptions: {
        fuzzy: 0.15,
      },
    });
    let files = [];
    if (response.data) {
      for (let slate of response.data.slates) {
        if (slate.data.objects.length) {
          files.push(
            ...slate.data.objects.map((file, i) => {
              return {
                type: "FILE",
                id: file.id,
                filename: file.title,
                data: { file, index: i, slate },
              };
            })
          );
        }
      }
      this.miniSearch.addAll(response.data.users);
      this.miniSearch.addAll(response.data.slates);
      this.miniSearch.addAll(files);
    }
  };

  fillPersonalDirectory = () => {
    this.personalSearch = new MiniSearch({
      fields: ["slatename", "data.name", "username", "filename"],
      storeFields: ["type", "slatename", "username", "data", "id", "slates", "owner"],
      extractField: (entry, fieldName) => {
        return fieldName.split(".").reduce((doc, key) => doc && doc[key], entry);
      },
      searchOptions: {
        fuzzy: 0.15,
      },
    });
    let files = this.props.viewer.library[0].children.map((file, i) => {
      return {
        type: "DATA_FILE",
        id: file.id,
        filename: file.name || file.file,
        data: {
          file: {
            ...file,
            url: `${Constants.gateways.ipfs}/${file.cid || file.ipfs.replace("/ipfs/", "")}`,
          },
          index: i,
        },
      };
    });
    let slates = this.props.viewer.slates.map((slate) => {
      return { ...slate, type: "SLATE", owner: this.props.viewer };
    });
    this.personalSearch.addAll(slates);
    let userIds = [];
    this.personalSearch.addAll(this.props.viewer.pendingTrusted.map((trust) => trust.owner));
    userIds.push(...this.props.viewer.pendingTrusted.map((trust) => trust.owner.id));
    this.personalSearch.addAll(
      this.props.viewer.trusted
        .filter((trust) => !userIds.includes(trust.user.id))
        .map((trust) => trust.user)
    );
    userIds.push(...this.props.viewer.trusted.map((trust) => trust.user.id));
    this.personalSearch.addAll(
      this.props.viewer.subscriptions
        .filter((sub) => sub.target_user_id && !userIds.includes(sub.user.id))
        .map((sub) => sub.user)
    );
    this.personalSearch.addAll(files);
  };

  _handleChange = (e) => {
    this.setState({ inputValue: e.target.value });
    //interpret the thing with handleInterpret (and change shownValue accordingly)
  };

  //converts input to search filter options
  _handleInterpret = (query) => {
    if (query.contains("files:")) {
    } else if (query.contains("users:")) {
    } else if (query.contains("slates:")) {
    } else if (query.contains("tags:")) {
    } else if (query.contains("#")) {
    } else if (query.contains("@")) {
    }
  };

  _handleSearch = () => {
    if (!this.state.loading) {
      let searchResults = this.miniSearch.search(this.state.inputValue);
      let ids = new Set();
      for (let result of searchResults) {
        ids.add(result.id);
      }
      let autofill = this.miniSearch.autoSuggest(this.state.inputValue);
      for (let i = 0; i < autofill.length; i++) {
        let result = this.miniSearch.search(autofill[i].suggestion)[0];
        if (!ids.has(result.id)) {
          ids.add(result.id);
          searchResults.push(result);
        }
      }
      this.setState({ results: searchResults });
    }
  };

  // _handleSearch = async () => {
  //   if (this.state.loading) return;

  //   if (this.state.filters["my"]) {
  //     let miniSearch = this.personalSearch;
  //     let filter;
  //     if (this.state.filters["files"]) {
  //       filter = {
  //         filter: (result) => {
  //           return result.type === "FILE" || result.type === "DATA_FILE";
  //         },
  //       };
  //     } else if (this.state.filters["users"]) {
  //       filter = {
  //         filter: (result) => result.type === "USER",
  //       };
  //     } else if (this.state.filters["slates"]) {
  //       filter = {
  //         filter: (result) => result.type === "SLATE",
  //       };
  //     }
  //     let searchResults;
  //     if (filter) {
  //       searchResults = miniSearch.search(this.state.inputValue, filter);
  //     } else {
  //       searchResults = miniSearch.search(this.state.inputValue);
  //     }
  //     let ids = new Set();
  //     for (let result of searchResults) {
  //       ids.add(result.id);
  //     }
  //     let autofill = miniSearch.autoSuggest(this.state.inputValue);
  //     for (let i = 0; i < autofill.length; i++) {
  //       let result;
  //       if (Object.keys(this.state.filter).length) {
  //         result = miniSearch.search(autofill[i].suggestion, this.state.filter);
  //       } else {
  //         result = miniSearch.search(autofill[i].suggestion);
  //       }
  //       if (result && result.length) {
  //         result = result[0];
  //         if (!ids.has(result.id)) {
  //           ids.add(result.id);
  //           searchResults.push(result);
  //         }
  //       }
  //     }
  //     this.setState({ results: searchResults });
  //   } else {
  //     const results = await Actions.search({
  //       query: this.state.inputValue,
  //       filter: this.state.filters,
  //     });
  //     this.setState({ results: results.data.results });
  //   }
  // };

  _handleSelect = async (value) => {
    if (value.type === "SLATE") {
      this.props.onAction({
        type: "NAVIGATE",
        value: "V1_NAVIGATION_SLATE",
        data: value.data,
      });
    }
    if (value.type === "USER") {
      this.props.onAction({
        type: "NAVIGATE",
        value: "V1_NAVIGATION_PROFILE",
        data: value.data,
      });
    }
    if (value.type === "DATA_FILE") {
      await this.props.onAction({
        type: "NAVIGATE",
        value: "data",
      });
      dispatchCustomEvent({
        name: "slate-global-open-carousel",
        detail: { index: value.data.data.index },
      });
    }
    if (value.type === "FILE") {
      await this.props.onAction({
        type: "NAVIGATE",
        value: "V1_NAVIGATION_SLATE",
        data: value.data.data.slate,
      });
      dispatchCustomEvent({
        name: "slate-global-open-carousel",
        detail: { index: value.data.data.index },
      });
    }
    dispatchCustomEvent({
      name: "delete-modal",
      detail: {},
    });
  };

  render() {
    let results = [];
    for (let item of this.state.results) {
      if (item.type === "USER") {
        results.push({
          value: {
            type: "USER",
            data: item,
          },
          component: <UserEntry item={item} />,
        });
      } else if (item.type === "SLATE") {
        results.push({
          value: {
            type: "SLATE",
            data: item,
          },
          component: <SlateEntry item={item} />,
        });
      } else if (item.type === "FILE" || item.type === "DATA_FILE") {
        results.push({
          value: {
            type: item.type,
            data: item,
          },
          component: <FileEntry item={item} />,
        });
      }
    }
    return (
      <div css={STYLES_CONTAINER}>
        <div css={STYLES_MODAL}>
          <SearchDropdown
            disabled={this.state.loading}
            placeholder="Search..."
            results={results}
            onSelect={this._handleSelect}
            onChange={this._handleChange}
            onSearch={this._handleSearch}
            inputValue={this.state.shownValue}
            style={STYLES_SEARCH_DROPDOWN}
          />
        </div>
      </div>
    );
  }
}
