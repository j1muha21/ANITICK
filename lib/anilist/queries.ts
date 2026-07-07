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

export const SEARCH_QUERY = /* GraphQL */ `
  query Search($q: String!) {
    Page(page: 1, perPage: 30) {
      media(search: $q, type: ANIME, sort: SEARCH_MATCH, isAdult: false) {
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

export const SYNC_LIST_QUERY = /* GraphQL */ `
  query SyncList($userId: Int!) {
    MediaListCollection(userId: $userId, type: ANIME) {
      lists {
        status
        entries {
          status
          media {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
        }
      }
    }
  }
`;

export const USER_STATS_QUERY = /* GraphQL */ `
  query UserStats($userId: Int!) {
    User(id: $userId) {
      statistics {
        anime {
          count
          episodesWatched
          minutesWatched
          meanScore
          statuses {
            status
            count
          }
          genres(limit: 12, sort: COUNT_DESC) {
            genre
            count
          }
        }
      }
    }
  }
`;

export const SAVE_LIST_ENTRY_MUTATION = /* GraphQL */ `
  mutation SaveListEntry($mediaId: Int!, $status: MediaListStatus!) {
    SaveMediaListEntry(mediaId: $mediaId, status: $status) {
      id
      status
    }
  }
`;
