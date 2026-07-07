export const MEDIA_CARD_FIELDS = /* GraphQL */ `
  fragment MediaCardFields on Media {
    id
    isAdult
    title {
      romaji
      english
    }
    coverImage {
      large
      extraLarge
      color
    }
    format
    episodes
    status
    season
    seasonYear
    genres
    averageScore
    popularity
    studios(isMain: true) {
      nodes {
        name
      }
    }
    nextAiringEpisode {
      airingAt
      episode
      timeUntilAiring
    }
    startDate {
      year
      month
      day
    }
  }
`;

export const TRENDING_QUERY = /* GraphQL */ `
  query Trending($perPage: Int!) {
    Page(page: 1, perPage: $perPage) {
      media(type: ANIME, status: RELEASING, sort: TRENDING_DESC, isAdult: false) {
        ...MediaCardFields
      }
    }
  }
  ${MEDIA_CARD_FIELDS}
`;

export const AIRING_TODAY_QUERY = /* GraphQL */ `
  query AiringToday($from: Int!, $to: Int!, $perPage: Int!) {
    Page(page: 1, perPage: $perPage) {
      airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
        airingAt
        episode
        media {
          ...MediaCardFields
        }
      }
    }
  }
  ${MEDIA_CARD_FIELDS}
`;

export const SEASONAL_QUERY = /* GraphQL */ `
  query Seasonal(
    $page: Int!
    $season: MediaSeason!
    $seasonYear: Int!
    $format: [MediaFormat]
    $genre: String
    $sort: [MediaSort]
  ) {
    Page(page: $page, perPage: 50) {
      pageInfo {
        currentPage
        hasNextPage
      }
      media(
        season: $season
        seasonYear: $seasonYear
        type: ANIME
        format_in: $format
        genre: $genre
        sort: $sort
        isAdult: false
      ) {
        ...MediaCardFields
      }
    }
  }
  ${MEDIA_CARD_FIELDS}
`;

export const MEDIA_BY_IDS_QUERY = /* GraphQL */ `
  query MediaByIds($ids: [Int]!) {
    Page(page: 1, perPage: 50) {
      media(id_in: $ids, type: ANIME) {
        ...MediaCardFields
      }
    }
  }
  ${MEDIA_CARD_FIELDS}
`;

export const MEDIA_DETAIL_QUERY = /* GraphQL */ `
  query MediaDetail($id: Int!) {
    Media(id: $id, type: ANIME) {
      ...MediaCardFields
      bannerImage
      description(asHtml: false)
      duration
      source
      airingSchedule(notYetAired: true, perPage: 25) {
        nodes {
          airingAt
          episode
        }
      }
    }
  }
  ${MEDIA_CARD_FIELDS}
`;

export const VIEWER_QUERY = /* GraphQL */ `
  query Viewer {
    Viewer {
      id
      name
      avatar {
        medium
      }
    }
  }
`;

export const MEDIA_LIST_QUERY = /* GraphQL */ `
  query MediaList($userId: Int!) {
    MediaListCollection(userId: $userId, type: ANIME, status_in: [CURRENT, PLANNING]) {
      lists {
        name
        status
        entries {
          progress
          media {
            ...MediaCardFields
          }
        }
      }
    }
  }
  ${MEDIA_CARD_FIELDS}
`;

export const ADD_TO_PLANNING_MUTATION = /* GraphQL */ `
  mutation AddToPlanning($mediaId: Int!) {
    SaveMediaListEntry(mediaId: $mediaId, status: PLANNING) {
      id
      status
    }
  }
`;
