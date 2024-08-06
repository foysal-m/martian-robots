import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { Board } from "./Board";
import { createRobot } from "../utilities/createRobot";

jest.mock("react-i18next", () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
}));

// Mock the createRobot function
jest.mock("../utilities/createRobot", () => ({
  createRobot: jest.fn(() => ({
    currentLocation: jest.fn(() => "0 0 N"),
    moveAroundBoard: jest.fn(),
  })),
}));

describe("Board Component", () => {
  beforeAll(() => {
    // Mock the HTMLAudioElement play and pause methods
    global.HTMLAudioElement.prototype.play = jest.fn();
    global.HTMLAudioElement.prototype.pause = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("moves the robot forward", () => {
    const moveAroundBoardMock = jest.fn();
    (createRobot as jest.Mock).mockReturnValue({
      currentLocation: jest.fn(() => "0 1 N"),
      moveAroundBoard: moveAroundBoardMock,
    });

    render(<Board />);

    const moveForwardButton = screen.getByText("Move Forward");

    fireEvent.click(moveForwardButton);
    expect(moveAroundBoardMock).toHaveBeenCalledWith("F");

    const updatedPosition = screen.getByText("Current Position: 0 1 N");
    expect(updatedPosition).toBeInTheDocument();
  });

  test("rotates the robot left", () => {
    const moveAroundBoardMock = jest.fn();
    (createRobot as jest.Mock).mockReturnValue({
      currentLocation: jest.fn(() => "0 0 W"),
      moveAroundBoard: moveAroundBoardMock,
    });

    render(<Board />);

    const rotateLeftButton = screen.getByText("Turn Left");

    fireEvent.click(rotateLeftButton);
    expect(moveAroundBoardMock).toHaveBeenCalledWith("L");

    const updatedPosition = screen.getByText("Current Position: 0 0 W");
    expect(updatedPosition).toBeInTheDocument();
  });

  test("rotates the robot right", () => {
    const moveAroundBoardMock = jest.fn();
    (createRobot as jest.Mock).mockReturnValue({
      currentLocation: jest.fn(() => "0 0 E"),
      moveAroundBoard: moveAroundBoardMock,
    });

    render(<Board />);

    const rotateRightButton = screen.getByText("Turn Right");

    fireEvent.click(rotateRightButton);
    expect(moveAroundBoardMock).toHaveBeenCalledWith("R");

    const updatedPosition = screen.getByText("Current Position: 0 0 E");
    expect(updatedPosition).toBeInTheDocument();
  });

  test("handles robot going out of bounds and plays audio", () => {
    // Mock the createRobot function to return the lost state
    (createRobot as jest.Mock).mockReturnValue({
      currentLocation: jest.fn(() => "0 7 N LOST"),
      moveAroundBoard: jest.fn(),
    });

    render(<Board />);

    const lostPosition = screen.getByText("Current Position: 0 7 N LOST");
    expect(lostPosition).toBeInTheDocument();

    // Verify if the audio is played
    expect(global.HTMLAudioElement.prototype.play).toHaveBeenCalledWith();

    // Check if the robot is hidden
    const robotCell = screen.queryByTestId("robot-cell");
    expect(robotCell).toBeNull();
  });
});
