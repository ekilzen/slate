import * as React from "react";
import * as Constants from "~/common/constants";
import * as Strings from "~/common/strings";
import * as SVG from "~/common/svg";
import * as Actions from "~/common/actions";
import * as Utilities from "~/common/utilities";
import * as Events from "~/common/custom-events";
import * as Window from "~/common/window";

import { GlobalCarousel } from "~/components/system/components/GlobalCarousel";
import { css } from "@emotion/react";
import { ButtonPrimary, ButtonSecondary } from "~/components/system/components/Buttons";
import { TabGroup, SecondaryTabGroup } from "~/components/core/TabGroup";
import { Boundary } from "~/components/system/components/fragments/Boundary";
import { PopoverNavigation } from "~/components/system/components/PopoverNavigation";
import { FileTypeGroup } from "~/components/core/FileTypeIcon";
import { LoaderSpinner } from "~/components/system/components/Loaders";

import ProcessedText from "~/components/core/ProcessedText";
import SlatePreviewBlocks from "~/components/core/SlatePreviewBlock";
import CTATransition from "~/components/core/CTATransition";
import DataView from "~/components/core/DataView";
import EmptyState from "~/components/core/EmptyState";

const STYLES_PROFILE_BACKGROUND = css`
  background-color: ${Constants.system.white};
  width: 100%;
  padding: 104px 56px 24px 56px;
  @media (max-width: ${Constants.sizes.mobile}px) {
    padding: 80px 24px 16px 24px;
  }
`;

const STYLES_PROFILE = css`
  width: 100%;
  padding: 0px 56px 80px 56px;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  @media (max-width: ${Constants.sizes.mobile}px) {
    padding: 0px 24px 16px 24px;
  }
`;

const STYLES_PROFILE_INFO = css`
  line-height: 1.3;
  width: 50%;
  max-width: 800px;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  margin: 0 auto;
  @media (max-width: ${Constants.sizes.tablet}px) {
    width: 100%;
    max-width: 100%;
  }
`;

const STYLES_INFO = css`
  display: block;
  width: 100%;
  text-align: center;
  margin-bottom: 48px;
  overflow-wrap: break-word;
  white-space: pre-wrap;
`;

const STYLES_PROFILE_IMAGE = css`
  background-color: ${Constants.system.foreground};
  background-size: cover;
  background-position: 50% 50%;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 4px;
  margin: 0 auto;
  position: relative;
  @media (max-width: ${Constants.sizes.mobile}px) {
    width: 64px;
    height: 64px;
  }
`;

const STYLES_STATUS_INDICATOR = css`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid ${Constants.system.active};
  background-color: ${Constants.system.active};
`;

const STYLES_NAME = css`
  font-size: ${Constants.typescale.lvl4};
  font-family: ${Constants.font.semiBold};
  max-width: 100%;
  font-weight: 400;
  margin: 16px auto;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  color: ${Constants.system.black};
  @media (max-width: ${Constants.sizes.mobile}px) {
    margin-bottom: 8px;
  }
`;

const STYLES_DESCRIPTION = css`
  font-size: ${Constants.typescale.lvl0};
  color: ${Constants.system.darkGray};
  max-width: 100%;
  overflow-wrap: break-word;
  white-space: pre-wrap;

  ul,
  ol {
    white-space: normal;
  }

  @media (max-width: ${Constants.sizes.mobile}px) {
    margin-top: 24px;
  }
`;

const STYLES_STATS = css`
  font-size: ${Constants.typescale.lvl0};
  margin: 16px auto;
  display: flex;
  justify-content: center;
  color: ${Constants.system.grayBlack};
`;

const STYLES_STAT = css`
  margin: 0px 12px;
  ${"" /* width: 112px; */}
  flex-shrink: 0;
`;

const STYLES_EXPLORE = css`
  font-size: ${Constants.typescale.lvl1};
  font-family: ${Constants.font.text};
  font-weight: 400;
  margin: 64px auto 64px auto;
  width: 120px;
  padding-top: 16px;
  border-top: 1px solid ${Constants.system.black};
`;

const STYLES_BUTTON = css`
  margin-bottom: 32px;

  @media (max-width: ${Constants.sizes.mobile}px) {
    margin-bottom: 16px;
  }
`;

const STYLES_ITEM_BOX = css`
  position: relative;
  justify-self: end;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin-right: 16px;
  color: ${Constants.system.darkGray};

  @media (max-width: ${Constants.sizes.mobile}px) {
    margin-right: 8px;
  }
`;

const STYLES_USER_ENTRY = css`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  font-size: ${Constants.typescale.lvl1};
  cursor: pointer;
  ${"" /* border: 1px solid ${Constants.system.lightBorder}; */}
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: ${Constants.system.white};
`;

const STYLES_USER = css`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  margin: 16px;
  color: ${Constants.system.brand};
  font-family: ${Constants.font.medium};
  font-size: ${Constants.typescale.lvl1};

  @media (max-width: ${Constants.sizes.mobile}px) {
    margin: 12px 16px;
  }
`;

const STYLES_DIRECTORY_PROFILE_IMAGE = css`
  background-color: ${Constants.system.foreground};
  background-size: cover;
  background-position: 50% 50%;
  height: 24px;
  width: 24px;
  margin-right: 16px;
  border-radius: 4px;
  position: relative;
`;

const STYLES_DIRECTORY_STATUS_INDICATOR = css`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1.2px solid ${Constants.system.active};
  background-color: ${Constants.system.active};
`;

const STYLES_MESSAGE = css`
  color: ${Constants.system.black};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  @media (max-width: 1000px) {
    display: none;
  }
`;

const STYLES_DIRECTORY_NAME = css`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

// const STYLES_COPY_INPUT = css`
//   pointer-events: none;
//   position: absolute;
//   opacity: 0;
// `;

function UserEntry({
  user,
  button,
  onClick,
  message,
  external,
  url,
  checkStatus,
  showStatusIndicator,
}) {
  const isOnline = checkStatus({ id: user.id });

  return (
    <div key={user.username} css={STYLES_USER_ENTRY}>
      {external ? (
        <a css={STYLES_USER} style={{ textDecoration: "none" }} href={url}>
          <div
            css={STYLES_DIRECTORY_PROFILE_IMAGE}
            style={{ backgroundImage: `url(${user.data.photo})` }}
          >
            {showStatusIndicator && isOnline && <div css={STYLES_DIRECTORY_STATUS_INDICATOR} />}
          </div>
          <span css={STYLES_DIRECTORY_NAME}>
            {user.data.name || `@${user.username}`}
            {message ? <span css={STYLES_MESSAGE}>{message}</span> : null}
          </span>
        </a>
      ) : (
        <div css={STYLES_USER} onClick={onClick}>
          <div
            css={STYLES_DIRECTORY_PROFILE_IMAGE}
            style={{ backgroundImage: `url(${user.data.photo})` }}
          >
            {isOnline && <div css={STYLES_DIRECTORY_STATUS_INDICATOR} />}
          </div>
          <span css={STYLES_DIRECTORY_NAME}>
            {user.data.name || `@${user.username}`}
            {message ? <span css={STYLES_MESSAGE}>{message}</span> : null}
          </span>
        </div>
      )}
      {external ? null : button}
    </div>
  );
}

export default class Profile extends React.Component {
  _ref = null;

  state = {
    view: 0,
    slateTab: 0,
    peerTab: 0,
    // copyValue: "",
    contextMenu: null,
    slates: this.props.user.slates,
    subscriptions: [],
    followers: [],
    following: [],
    isFollowing:
      this.props.external || this.props.user.id === this.props.viewer?.id
        ? false
        : !!this.props.viewer?.following.some((entry) => {
            return entry.id === this.props.user.id;
          }),
    fetched: false,
    tab: this.props.tab || 0,
  };

  componentDidMount = () => {
    this._handleUpdatePage();
  };

  componentDidUpdate = (prevProps) => {
    if (this.props.page?.tab !== prevProps.page?.tab) {
      this.setState({ tab: this.props.page.tab });
    }
  };

  fetchSocial = async () => {
    if (this.state.fetched) return;
    let following, followers, subscriptions;
    if (this.props.user.id === this.props.viewer?.id) {
      following = this.props.viewer?.following;
      followers = this.props.viewer?.followers;
      subscriptions = this.props.viewer?.subscriptions;
    } else {
      const query = { id: this.props.user.id };
      let response = await Actions.getSocial(query);
      if (Events.hasError(response)) {
        return;
      }
      following = response.following;
      followers = response.followers;
      subscriptions = response.subscriptions;
    }
    this.setState({
      following: following,
      followers: followers,
      subscriptions: subscriptions,
      fetched: true,
    });
  };

  // _handleCopy = (e, value) => {
  //   e.stopPropagation();
  //   this.setState({ copyValue: value }, () => {
  //     this._ref.select();
  //     document.execCommand("copy");
  //     this._handleHide();
  //   });
  // };

  _handleHide = (e) => {
    this.setState({ contextMenu: null });
  };

  _handleClick = (e, value) => {
    e.stopPropagation();
    if (this.state.contextMenu === value) {
      this._handleHide();
    } else {
      this.setState({ contextMenu: value });
    }
  };

  _handleFollow = async (e, id) => {
    if (this.props.external) {
      this._handleRedirectToInternal();
    }
    this._handleHide();
    e.stopPropagation();
    await Actions.createSubscription({
      userId: id,
    });
  };

  _handleRedirectToInternal = () => {
    this.setState({ visible: true });
  };

  _handleSwitchTab = (tab) => {
    if (typeof window !== "undefined") {
      this.setState({ tab });
      window.history.pushState({ ...window.history.state, tab }, "", window.location.pathname);
    }
    if (tab === 2 && !this.state.fetched) {
      this.fetchSocial();
    }
  };

  _handleUpdatePage = () => {
    let tab;
    if (typeof window !== "undefined") {
      tab = window?.history?.state.tab;
    }
    if (typeof tab === "undefined") {
      tab = 0;
    }
    this.setState({ tab }, () => {
      if (this.state.tab === 2 || (this.state.tab === 1 && this.state.slateTab === 1)) {
        this.fetchSocial();
      }
    });
  };

  checkStatus = ({ id }) => {
    const { activeUsers } = this.props;
    return activeUsers && activeUsers.includes(id);
  };

  render() {
    let tab = this.state.tab || 0;
    let publicFiles = this.props.user.library;
    let isOwner = this.props.isOwner;
    let user = this.props.user;
    let username = this.state.slateTab === 0 ? user.username : null;
    let slates = [];
    if (tab === 1) {
      if (this.state.slateTab === 0) {
        slates = user.slates
          ? isOwner
            ? user.slates.filter((slate) => slate.isPublic === true)
            : user.slates
          : null;
      } else {
        slates = this.state.subscriptions;
      }
    }
    let exploreSlates = this.props.exploreSlates;
    let peers = this.state.peerTab === 0 ? this.state.following : this.state.followers;
    if (tab === 2) {
      peers = peers.map((relation) => {
        let button = (
          <div css={STYLES_ITEM_BOX} onClick={(e) => this._handleClick(e, relation.id)}>
            <SVG.MoreHorizontal height="24px" />
            {this.state.contextMenu === relation.id ? (
              <Boundary
                captureResize={true}
                captureScroll={false}
                enabled
                onOutsideRectEvent={(e) => this._handleClick(e, relation.id)}
              >
                <PopoverNavigation
                  style={{
                    top: "40px",
                    right: "0px",
                  }}
                  navigation={[
                    {
                      text: this.props.viewer?.following.some((subscription) => {
                        return subscription.id === relation.id;
                      }).length
                        ? "Unfollow"
                        : "Follow",
                      onClick: this.props.viewer
                        ? (e) => this._handleFollow(e, relation.id)
                        : () => this.setState({ visible: true }),
                    },
                  ]}
                />
              </Boundary>
            ) : null}
          </div>
        );

        return (
          <UserEntry
            key={relation.id}
            user={relation}
            button={button}
            checkStatus={this.checkStatus}
            showStatusIndicator={this.props.isAuthenticated}
            onClick={() => {
              this.props.onAction({
                type: "NAVIGATE",
                value: this.props.sceneId,
                scene: "PROFILE",
                data: relation,
              });
            }}
            external={this.props.external}
            url={`/${relation.username}`}
          />
        );
      });
    }

    let total = 0;
    if (user.slates) {
      total = user.slates.reduce((total, slate) => {
        return total + slate.data?.objects?.length || 0;
      }, 0);
    }

    const showStatusIndicator = this.props.isAuthenticated;

    return (
      <div>
        <GlobalCarousel
          carouselType="PROFILE"
          onUpdateViewer={this.props.onUpdateViewer}
          resources={this.props.resources}
          viewer={this.props.viewer}
          objects={publicFiles}
          isOwner={this.props.isOwner}
          onAction={this.props.onAction}
          isMobile={this.props.isMobile}
          external={this.props.external}
        />
        <div css={STYLES_PROFILE_BACKGROUND}>
          <div css={STYLES_PROFILE_INFO}>
            <div
              css={STYLES_PROFILE_IMAGE}
              style={{
                backgroundImage: `url('${user.data.photo}')`,
              }}
            >
              {showStatusIndicator && this.checkStatus({ id: user.id }) && (
                <div css={STYLES_STATUS_INDICATOR} />
              )}
            </div>
            <div css={STYLES_INFO}>
              <div css={STYLES_NAME}>{Strings.getPresentationName(user)}</div>
              {!isOwner && (
                <div css={STYLES_BUTTON}>
                  {this.state.isFollowing ? (
                    <ButtonSecondary
                      onClick={(e) => {
                        this.setState({ isFollowing: false });
                        this._handleFollow(e, this.props.user.id);
                      }}
                    >
                      Unfollow
                    </ButtonSecondary>
                  ) : (
                    <ButtonPrimary
                      onClick={(e) => {
                        this.setState({ isFollowing: true });
                        this._handleFollow(e, this.props.user.id);
                      }}
                    >
                      Follow
                    </ButtonPrimary>
                  )}
                </div>
              )}
              {user.data.body ? (
                <div css={STYLES_DESCRIPTION}>
                  <ProcessedText text={user.data.body} />
                </div>
              ) : null}
              <div css={STYLES_STATS}>
                <div css={STYLES_STAT}>
                  <div style={{ fontFamily: `${Constants.font.text}` }}>
                    {total} <span style={{ color: `${Constants.system.darkGray}` }}>Files</span>
                  </div>
                </div>
                <div css={STYLES_STAT}>
                  <div style={{ fontFamily: `${Constants.font.text}` }}>
                    {user.slates?.length || 0}{" "}
                    <span style={{ color: `${Constants.system.darkGray}` }}>Slates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {this.state.visible && (
          <div>
            <CTATransition
              onClose={() => this.setState({ visible: false })}
              viewer={this.props.viewer}
              open={this.state.visible}
              redirectURL={`/_${Strings.createQueryParams({
                scene: "NAV_PROFILE",
                user: user.username,
              })}`}
            />
          </div>
        )}
        <div css={STYLES_PROFILE}>
          <TabGroup
            tabs={["Files", "Slates", "Peers"]}
            value={tab}
            onChange={this._handleSwitchTab}
            style={{ marginTop: 0, marginBottom: 32 }}
            itemStyle={{ margin: "0px 16px" }}
          />
          {tab === 0 ? (
            <div>
              {this.props.isMobile ? null : (
                <div style={{ display: `flex` }}>
                  <SecondaryTabGroup
                    tabs={[
                      <SVG.GridView height="24px" style={{ display: "block" }} />,
                      <SVG.TableView height="24px" style={{ display: "block" }} />,
                    ]}
                    value={this.state.view}
                    onChange={(value) => this.setState({ view: value })}
                    style={{ margin: "0 0 24px 0", justifyContent: "flex-end" }}
                  />
                </div>
              )}
              {publicFiles.length ? (
                <DataView
                  key="scene-profile"
                  onAction={this.props.onAction}
                  viewer={this.props.viewer}
                  isOwner={isOwner}
                  items={publicFiles}
                  onUpdateViewer={this.props.onUpdateViewer}
                  view={this.state.view}
                  resources={this.props.resources}
                />
              ) : (
                <EmptyState>
                  <FileTypeGroup />
                  <div style={{ marginTop: 24 }}>This user does not have any public files yet</div>
                </EmptyState>
              )}
            </div>
          ) : null}
          {tab === 1 ? (
            <div>
              <SecondaryTabGroup
                tabs={["Slates", "Following"]}
                value={this.state.slateTab}
                onChange={(value) => {
                  this.setState({ slateTab: value }, () => {
                    if (!this.state.fetched) {
                      this.fetchSocial();
                    }
                  });
                }}
                style={{ margin: "0 0 24px 0" }}
              />
              {slates?.length ? (
                <SlatePreviewBlocks
                  isOwner={this.state.slateTab === 0 ? isOwner : false}
                  external={this.props.external}
                  slates={slates || []}
                  username={username}
                  onAction={this.props.onAction}
                />
              ) : (
                <React.Fragment>
                  {this.props.external && exploreSlates.length != 0 ? (
                    <React.Fragment>
                      <EmptyState style={{ border: `none`, height: `120px` }}>
                        {this.state.fetched || this.state.slateTab == 0 ? (
                          <React.Fragment>
                            <SVG.Slate height="24px" style={{ marginBottom: 24 }} />
                            {this.state.slateTab === 0
                              ? `This user does not have any public slates yet`
                              : `This user is not following any slates yet`}
                          </React.Fragment>
                        ) : (
                          <LoaderSpinner style={{ height: 24, width: 24 }} />
                        )}
                      </EmptyState>
                      <div css={STYLES_EXPLORE}>Explore Slates</div>
                      <SlatePreviewBlocks
                        isOwner={false}
                        external={this.props.external}
                        slates={exploreSlates}
                        username={exploreSlates.username}
                        onAction={this.props.onAction}
                      />
                    </React.Fragment>
                  ) : (
                    <EmptyState>
                      {this.state.fetched || this.state.slateTab == 0 ? (
                        <React.Fragment>
                          <SVG.Slate height="24px" style={{ marginBottom: 24 }} />
                          {this.state.slateTab === 0
                            ? `This user does not have any public slates yet`
                            : `This user is not following any slates yet`}
                        </React.Fragment>
                      ) : (
                        <LoaderSpinner style={{ height: 24, width: 24 }} />
                      )}
                    </EmptyState>
                  )}
                </React.Fragment>
              )}
            </div>
          ) : null}
          {tab === 2 ? (
            <div>
              <SecondaryTabGroup
                tabs={["Following", "Followers"]}
                value={this.state.peerTab}
                onChange={(value) => this.setState({ peerTab: value })}
                style={{ margin: "0 0 24px 0" }}
              />
              <div>
                {peers?.length ? (
                  peers
                ) : (
                  <EmptyState>
                    {this.state.fetched || this.state.slateTab == 0 ? (
                      <React.Fragment>
                        <SVG.Users height="24px" style={{ marginBottom: 24 }} />
                        {this.state.peerTab === 0
                          ? `This user is not following anyone yet`
                          : `This user does not have any followers yet`}
                      </React.Fragment>
                    ) : (
                      <LoaderSpinner style={{ height: 24, width: 24 }} />
                    )}
                  </EmptyState>
                )}
              </div>
              {/* <input
                readOnly
                ref={(c) => {
                  this._ref = c;
                }}
                value={this.state.copyValue}
                tabIndex="-1"
                css={STYLES_COPY_INPUT}
              /> */}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
