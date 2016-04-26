import track from './track';
import layout from './layout';
import playingIndex from './playingIndex';
import cursorReducer from './cursor';
import { prepareTrack } from '../util';
import { COPY_NOTE, CUT_NOTE, CHANGE_LAYOUT, INSERT_TRACK,
  DELETE_TRACK, SELECT_TRACK, INSERT_MEASURE, DELETE_MEASURE,
  CHANGE_BPM, CHANGE_TIME_SIGNATURE, SET_PLAYING_INDEX, TOGGLE_METRONOME,
  SET_CURSOR, MOVE_CURSOR_LEFT, MOVE_CURSOR_RIGHT, REPLACE_SONG,
  MOVE_CURSOR_UP, MOVE_CURSOR_DOWN, SET_SELECT_RANGE } from '../actions/types';

const replaceTrack = (tracks, action, currentTrackIndex, layout = 'page') => {
  return tracks.map((t, index) => {
    if(index === currentTrackIndex) {
      const newTrack = track(t, action);
      return prepareTrack(newTrack, layout, { width: window.innerWidth - 10 });
    }
    return t;
  });
};

const applyActionToEachTrack = (state, action) => {
  const currentTrack = state.tracks[state.currentTrackIndex];
  const newTracks = state.tracks.map((t) => prepareTrack(track(t, action), state.layout, { width: window.innerWidth - 10 }));

  return {
    ...state,
    tracks: newTracks,
    layout: layout(state.layout, action),
    playingIndex: playingIndex(state.playingIndex, action),
    cursor: cursorReducer(state.cursor, action, currentTrack.measures, currentTrack.tuning)
  };
};

const defaultCursor = {
  measureIndex: 0,
  noteIndex: 0,
  stringIndex: 0
};

const defaultTrack = (state) => {
  const currentTrack = state.tracks[state.currentTrackIndex];

  return {
    instrument: currentTrack.instrument,
    tuning: currentTrack.tuning,
    measures: currentTrack.measures.map((measure) => ({
      bpm: measure.bpm,
      timeSignature: measure.timeSignature,
      notes: []
    }))
  };
};

export default function tracks(state = {}, action) {
  switch(action.type) {
    case INSERT_TRACK: {
      const newTrack = defaultTrack(state);

      return {
        ...state,
        tracks: replaceTrack(state.tracks.concat(newTrack), action, state.tracks.length, state.layout),
        currentTrackIndex: state.tracks.length,
        cursor: defaultCursor
      };
    }

    case DELETE_TRACK:
      if(state.tracks.length === 1) {
        return {
          ...state,
          tracks: replaceTrack([defaultTrack(state)], action, 0, state.layout),
          cursor: defaultCursor
        };
      }
      return {
        ...state,
        tracks: state.tracks.filter((_, i) => state.currentTrackIndex !== i),
        currentTrackIndex: 0,
        cursor: defaultCursor
      };

    case SELECT_TRACK:
      return {
        ...state,
        currentTrackIndex: action.index,
        cursor: defaultCursor
      };

    case TOGGLE_METRONOME:
      return {
        ...state,
        metronome: !state.metronome
      };

    case INSERT_MEASURE: {
      return applyActionToEachTrack(state, action);
    }

    case DELETE_MEASURE: {
      return applyActionToEachTrack(state, action);
    }

    case CHANGE_BPM: {
      return applyActionToEachTrack(state, action);
    }

    case CHANGE_TIME_SIGNATURE: {
      return applyActionToEachTrack(state, action);
    }

    case REPLACE_SONG: {
      const tracks = action.tracks.map(track => prepareTrack(track, state.layout, { width: window.innerWidth - 10 }));

      return {
        ...state,
        currentTrackIndex: 0,
        tracks,
        cursor: defaultCursor
      };
    }

    case COPY_NOTE:
      return {
        ...state,
        clipboard: action.selection
      };

    case CUT_NOTE: {
      return {
        ...state,
        clipboard: action.selection,
        tracks: replaceTrack(state.tracks, action, state.currentTrackIndex, state.layout)
      };
    }

    case CHANGE_LAYOUT: {
      const newLayout = layout(state.layout, action);
      return {
        ...state,
        tracks: replaceTrack(state.tracks, action, state.currentTrackIndex, newLayout),
        layout: newLayout
      };
    }

    case SET_PLAYING_INDEX:
      return {
        ...state,
        playingIndex: playingIndex(state.playingIndex, action)
      };

    case SET_CURSOR:
    case MOVE_CURSOR_LEFT:
    case MOVE_CURSOR_RIGHT:
    case MOVE_CURSOR_UP:
    case MOVE_CURSOR_DOWN: {
      const currentTrack = state.tracks[state.currentTrackIndex];
      return {
        ...state,
        cursor: cursorReducer(state.cursor, action, currentTrack.measures, currentTrack.tuning)
      };
    }

    case SET_SELECT_RANGE: {
      return {
        ...state,
        selectRange: action.range,
        cursor: cursorReducer(state.cursor, action)
      };
    }

    default: {
      const currentTrack = state.tracks[state.currentTrackIndex];

      return {
        ...state,
        tracks: replaceTrack(state.tracks, action, state.currentTrackIndex, state.layout),
        cursor: cursorReducer(state.cursor, action, currentTrack.measures, currentTrack.tuning)
      };
    }
  }
}
