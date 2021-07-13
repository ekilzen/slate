import * as Utilities from "~/node_common/utilities";
import * as Data from "~/node_common/data";
import * as LinkUtilities from "~/node_common/link-utilities";
import * as Strings from "~/common/strings";
import * as ViewerManager from "~/node_common/managers/viewer";
import * as SearchManager from "~/node_common/managers/search";
import * as ArrayUtilities from "~/node_common/array-utilities";
import * as Monitor from "~/node_common/monitor";

export default async (req, res) => {
  if (Strings.isEmpty(req.headers.authorization)) {
    return res.status(404).send({
      decorator: "NO_API_KEY_PROVIDED",
      error: true,
    });
  }

  const parsed = Strings.getKey(req.headers.authorization);

  const key = await Data.getAPIKeyByKey({
    key: parsed,
  });

  if (!key) {
    return res.status(403).send({
      decorator: "NO_MATCHING_API_KEY_FOUND",
      error: true,
    });
  }

  if (key.error) {
    return res.status(500).send({
      decorator: "ERROR_WHILE_VERIFYING_API_KEY",
      error: true,
    });
  }

  const user = await Data.getUserById({
    id: key.ownerId,
  });

  if (!user) {
    return res.status(404).send({
      decorator: "API_KEY_OWNER_NOT_FOUND",
      error: true,
    });
  }

  if (user.error) {
    return res.status(500).send({
      decorator: "ERROR_WHILE_LOCATING_API_KEY_OWNER",
      error: true,
    });
  }

  let decorator = "SERVER_CREATE_LINK";
  const slateId = req.body.data.slate?.id;
  let slate;
  if (slateId) {
    slate = await Data.getSlateById({ id: slateId });

    if (!slate || slate.error) {
      slate = null;
      decorator = "SERVER_CREATE_LINK_SLATE_NOT_FOUND";
    }
  }

  let urls;
  if (req.body.data.url) {
    urls = [req.body.data.url];
  } else if (req.body.data.urls) {
    urls = req.body.data.urls;
  } else {
    return res.status(400).send({ decorator: "SERVER_CREATE_LINK_NO_LINK_PROVIDED", error: true });
  }

  let files = [];
  for (let url of urls) {
    const cid = await LinkUtilities.getCIDofString(url);
    files.push({ cid, url });
  }

  let { duplicateFiles, filteredFiles } = await ArrayUtilities.removeDuplicateUserFiles({
    files,
    user,
  });

  if (!filteredFiles?.length) {
    return res.status(400).send({ decorator: "SERVER_CREATE_LINK_DUPLICATE", error: true });
  }

  files = [];

  for (let file of filteredFiles) {
    const url = file.url;
    const data = await LinkUtilities.fetchLinkData(url);
    if (!data) {
      continue;
    }

    const filename = Strings.createSlug(data.title);

    const domain = LinkUtilities.getDomainFromURL(url);

    const html = await LinkUtilities.fetchEmbed(url);

    const iFrameAllowed = await LinkUtilities.testIframe(url);

    const newFile = {
      filename,
      cid: file.cid,
      isLink: true,
      url: file.url,
      data: {
        type: "link",
        size: 0,
        name: data.title || "",
        author: data.author || "",
        source: data.publisher || "",
        body: data.description || "",
        coverImage: data.screenshot
          ? {
              data: {
                type: "image/png",
                size: data.screenshot.size,
                url: data.screenshot.url,
              },
            }
          : null,
        link: {
          name: data.title || "",
          author: data.author || "",
          source: data.publisher || "",
          body: data.description || "",
          image: data.image?.url,
          logo: data.logo?.url,
          domain,
          html,
          iFrameAllowed,
        },
      },
    };

    files.push(newFile);
  }

  if (!files?.length) {
    return res.status(400).send({ decorator: "SERVER_CREATE_LINK_INVALID_LINK", error: true });
  }

  if (slate?.isPublic) {
    files = files.map((file) => {
      return { ...file, isPublic: true };
    });
  }

  let createdFiles = [];
  if (files?.length) {
    createdFiles = (await Data.createFile({ owner: user, files })) || [];

    if (!createdFiles?.length) {
      return res.status(404).send({ decorator: "SERVER_CREATE_LINK_FAILED", error: true });
    }

    if (createdFiles.error) {
      return res.status(500).send({ decorator: createdFiles.decorator, error: createdFiles.error });
    }
  }

  for (let file of createdFiles) {
    LinkUtilities.uploadScreenshot(file, user);
  }

  let added = createdFiles?.length || 0;

  let filesToAddToSlate = createdFiles.concat(duplicateFiles); //NOTE(martina): files that are already owned by the user are included in case they aren't yet in that specific slate
  if (slate && filesToAddToSlate.length) {
    const { decorator: returnedDecorator, added: addedToSlate } = await Utilities.addToSlate({
      slate,
      files: filesToAddToSlate,
      user,
    });
    if (returnedDecorator) {
      decorator = returnedDecorator;
    }
    added = addedToSlate;
  }

  if (slate?.isPublic) {
    SearchManager.updateFile(createdFiles, "ADD");
  }
  ViewerManager.hydratePartial(id, { library: true, slates: slate ? true : false });

  if (!slate) {
    Monitor.upload({ user, files });
  }

  return res.status(200).send({
    decorator,
    data: { added, skipped: files.length - added },
  });
};