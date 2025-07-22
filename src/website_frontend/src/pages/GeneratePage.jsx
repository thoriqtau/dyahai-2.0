import React, { useState } from "react";
import { useAuth } from "../hooks/authHook";
import { uploadBlobToStoracha } from "../hooks/authStoracha";

import Swal from "sweetalert2";
import Button from "../components/ui/Button";
import Loader from "../components/layout/Loader";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { IoMdDownload } from "react-icons/io";
import { IoArrowForwardCircleOutline } from "react-icons/io5";

import Navbar from "../components/layout/Navbar";
import imageAstronout from "../assets/images/art-styles-models/man/Astronout.jpg";
import imageBackpacker from "../assets/images/art-styles-models/man/Backpacker.jpg";
import imageCyberpunk from "../assets/images/art-styles-models/man/Cyberpunk.jpg";
import imageDetective from "../assets/images/art-styles-models/man/Detective.jpg";
import imageDreamworks from "../assets/images/art-styles-models/man/Dreamworks.jpg";
import imageRenaissance from "../assets/images/art-styles-models/man/Renaissance.jpg";
import imageRetro from "../assets/images/art-styles-models/man/Retro.jpg";
import imageSteampunk from "../assets/images/art-styles-models/man/Steampunk.jpg";
import imageStreetwear from "../assets/images/art-styles-models/man/Streetwear.jpg";
import imageSuperhero from "../assets/images/art-styles-models/man/Superhero.jpg";
import imageWasteland from "../assets/images/art-styles-models/man/Wasteland.jpg";
import imageArtisticW from "../assets/images/art-styles-models/women/Artistic.jpg";
import imageCyberpunkW from "../assets/images/art-styles-models/women/Cyberpunk.jpg";
import imageDreamy from "../assets/images/art-styles-models/women/Dreamy.jpg";
import imageFashion from "../assets/images/art-styles-models/women/Fashion.jpg";
import imageKorean from "../assets/images/art-styles-models/women/Korean.jpg";
import imageNature from "../assets/images/art-styles-models/women/Nature.jpg";
import imageRenaissanceW from "../assets/images/art-styles-models/women/Renaissance.jpg";
import imageRetroW from "../assets/images/art-styles-models/women/Retro.jpg";
import imageSchool from "../assets/images/art-styles-models/women/School.jpg";
import imageSoft from "../assets/images/art-styles-models/women/Soft.jpg";
import imageSunset from "../assets/images/art-styles-models/women/Sunset.jpg";




const GeneratePage = () => {
  const { credit, principalId, isLoggedIn, Login, Logout, refreshCredit, actor } = useAuth();
  const [state, setState] = useState({
    isLoading: false,
    selectedFile: null,
    output: "",
    imageUrl: "",
    selectedStyle: "",
    balance: 0,
  });

  const itemStyle = [
    {
      id: "1",
      label: "Astronout Man",
      image: imageAstronout, 
      getFile: async () => {
        const response = await fetch(imageAstronout);
        return await response.blob();
      },
    },
    {
      id: "2",
      label: "Cyberpunk Man",
      image: imageCyberpunk, 
      getFile: async () => {
        const response = await fetch(imageCyberpunk);
        return await response.blob();
      },
    },
    {
      id: "3",
      label: "Detective Man",
      image: imageDetective, 
      getFile: async () => {
        const response = await fetch(imageDetective);
        return await response.blob();
      },
    },
    {
      id: "4",
      label: "Dreamworks Man",
      image: imageDreamworks, 
      getFile: async () => {
        const response = await fetch(imageDreamworks);
        return await response.blob();
      },
    },
    {
      id: "5",
      label: "Renaissance Man",
      image: imageRenaissance, 
      getFile: async () => {
        const response = await fetch(imageRenaissance);
        return await response.blob();
      },
    },
    {
      id: "6",
      label: "Retro Man",
      image: imageRetro, 
      getFile: async () => {
        const response = await fetch(imageRetro);
        return await response.blob();
      },
    },
    {
      id: "7",
      label: "Steampunk Man",
      image: imageSteampunk, 
      getFile: async () => {
        const response = await fetch(imageSteampunk);
        return await response.blob();
      },
    },
    {
      id: "8",
      label: "Streetwear Man",
      image: imageStreetwear, 
      getFile: async () => {
        const response = await fetch(imageStreetwear);
        return await response.blob();
      },
    },
    {
      id: "9",
      label: "Superhero Man",
      image: imageSuperhero, 
      getFile: async () => {
        const response = await fetch(imageSuperhero);
        return await response.blob();
      },
    },
    {
      id: "10",
      label: "Wasteland Man",
      image: imageWasteland, 
      getFile: async () => {
        const response = await fetch(imageWasteland);
        return await response.blob();
      },
    },
    {
      id: "11",
      label: "Artistic Women",
      image: imageArtisticW, 
      getFile: async () => {
        const response = await fetch(imageArtisticW);
        return await response.blob();
      },
    },
    {
      id: "12",
      label: "Cyberpunk Women",
      image: imageCyberpunkW, 
      getFile: async () => {
        const response = await fetch(imageCyberpunkW);
        return await response.blob();
      },
    },
    {
      id: "13",
      label: "Dreamy Women",
      image: imageDreamy, 
      getFile: async () => {
        const response = await fetch(imageDreamy);
        return await response.blob();
      },
    },
    {
      id: "14",
      label: "Fashion Women",
      image: imageFashion, 
      getFile: async () => {
        const response = await fetch(imageFashion);
        return await response.blob();
      },
    },
    {
      id: "15",
      label: "Korean Women",
      image: imageKorean, 
      getFile: async () => {
        const response = await fetch(imageKorean);
        return await response.blob();
      },
    },
    {
      id: "16",
      label: "Nature Women",
      image: imageNature, 
      getFile: async () => {
        const response = await fetch(imageNature);
        return await response.blob();
      },
    },
    {
      id: "17",
      label: "Renaissance Women",
      image: imageRenaissanceW, 
      getFile: async () => {
        const response = await fetch(imageRenaissanceW);
        return await response.blob();
      },
    },
    {
      id: "18",
      label: "Retro Women",
      image: imageRetroW, 
      getFile: async () => {
        const response = await fetch(imageRetroW);
        return await response.blob();
      },
    },
    {
      id: "19",
      label: "School Women",
      image: imageSchool, 
      getFile: async () => {
        const response = await fetch(imageSchool);
        return await response.blob();
      },
    },
    {
      id: "20",
      label: "Soft Women",
      image: imageSoft, 
      getFile: async () => {
        const response = await fetch(imageSoft);
        return await response.blob();
      },
    },
    {
      id: "21",
      label: "Sunset Women",
      image: imageSunset, 
      getFile: async () => {
        const response = await fetch(imageSunset);
        return await response.blob();
      },
    },
    {
      id: "22",
      label: "Backpacker Man",
      image: imageBackpacker, 
      getFile: async () => {
        const response = await fetch(imageBackpacker);
        return await response.blob();
      },
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
  };

  const showAlert = (icon, title, text) => {
    Swal.fire({ icon, title, text, confirmButtonText: "OK" });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    console.log("Selected file:", file);
    console.log("File type:", file.type);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setState((prev) => ({ ...prev, selectedFile: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (credit <= 0) {
      showAlert("warning", "WARNING!!!", "Insufficient credit. Please add credit to generate images.");
      return;
    }
    const { selectedFile, selectedStyle } = state;
    if (!selectedFile || !selectedStyle) {
      showAlert(
        "warning",
        "WARNING!!!",
        !selectedFile
          ? "Please upload an image first."
          : "Please select a style first.",
      );
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const blob = base64ToBlob(selectedFile);
      console.log("Converting base64 to blob:", blob);
      console.log("Principal", principalId);
      await uploadImageToBackend(blob);
    } catch (error) {
      console.error("Error uploading image:", error);
      setState((prev) => ({
        ...prev,
        output: "An error occurred while uploading the image.",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
      await refreshCredit();
    }
  };

  const base64ToBlob = (base64, type = "image/jpeg") => {
    const byteCharacters = atob(base64.split(",")[1]);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([byteNumbers], { type });
  };

  const uploadImageToBackend = async (imageBlob) => {
    try {
      const { selectedStyle } = state;
      const nat8Array = new Uint8Array(await imageBlob.arrayBuffer());
      const styleBlob = await selectedStyle.getFile();
      const styleNat8Array = new Uint8Array(await styleBlob.arrayBuffer());

      const response = await actor.send_http_post_request(
        nat8Array,
        styleNat8Array,
      );
      console.log("Job ID:", response);
      console.log("Response dari backend Jalan mas:>>", response.type);
      const jobIdText = new TextDecoder().decode(response);
      console.log("Job ID baru:", jobIdText);
      await pollUntilReady(jobIdText);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const pollUntilReady = async (jobId) => {
    const maxRetries = 30;
    const delay = 4000;
    let attempt = 0;

    while (attempt < maxRetries) {

    console.log('attempt : ', attempt)
      try {
        console.log('status belum terpanggil')
        const result = await actor.check_style_status(jobId);
        console.log('status sudah terpanggil : ', result.status)
        if (result.status === "COMPLETED" && result.image) {
          console.log('status sudah completed')

          const byteArray = result.image[0]; 
          console.log('result.image:', result.image[0]);
          console.log('Length of result.image:', byteArray.length);
          const blob = new Blob([byteArray], { type: "image/png" });
          console.log("data gambar ", blob)
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          setState((prev) => ({ ...prev, imageUrl: dataUrl }));
          const storachaResult = await uploadBlobToStoracha(blob);
          console.log("storachaResult:", storachaResult);

          await actor.save_image_to_store(storachaResult.toString());
          return;

        } else if (result.status === "FAILED") {
          showAlert("error", "Error", "Image generation failed.");
          return;
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
    }
    showAlert("error", "Timeout", "Image generation took too long.");
};


  // const blobToBase64 = (blob) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onloadend = () => resolve(reader.result.split(",")[1]);
  //     reader.onerror = reject;
  //     reader.readAsDataURL(new Blob([new Uint8Array(blob)]));
  //   });
  // };

  const handleDeleteAllImages = async () => {
    try {
      const success = await actor.deleteAllImages();
      console.log(
        success
          ? "All images deleted successfully."
          : "Failed to delete all images.",
      );
    } catch (error) {
      console.error("Error deleting all images:", error);
    }
  };

  const handleDownloadImage = () => {
    if (!state.imageUrl) {
      showAlert("warning", "WARNING!!!", "Image Not Found");
      return;
    }
    const link = document.createElement("a");
    link.href = state.imageUrl;
    link.download = "generated-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addCredit = async () => {
    try {
      await actor.addCredit(principalId, 1);
      const updatedBalance = await actor.get_balance();
      setState((prev) => ({ ...prev, balance: updatedBalance.toString() }));
    } catch (error) {
      console.error("Error adding credit:", error);
    }
  };

  return (
    <>
      {state.isLoading && <Loader />}
      <div className="bg-primaryColor flex h-screen w-full flex-col justify-center md:flex-row">
        <Navbar navbarStyle={"secondary"} principalId={principalId} isLoggedIn={isLoggedIn} credit={credit} Login={Login} Logout={Logout}/>
        <div className="bg-primaryColor relative mt-24 flex h-full w-full flex-col items-center justify-start md:fixed md:mt-14 md:flex-row">
          <div className="border-borderShade h-full w-full border-r-2 border-opacity-40 md:w-1/3">
            <div className="flex flex-col items-center gap-y-6 py-8 text-center">
              <div className="text-white">
                <p>Image</p>
              </div>
              <div className="flex w-full flex-col items-center justify-center">
                <label
                  htmlFor="dropzone-file"
                  className="bg-secondaryColor hover:bg-borderShade flex h-[16rem] w-[16rem] cursor-pointer flex-col items-center justify-center rounded-lg p-1"
                >
                  <div className="border-borderShade flex h-full w-full flex-col items-center justify-center rounded-lg border border-opacity-40">
                    {state.selectedFile ? (
                      <img
                        src={state.selectedFile}
                        alt="Selected File"
                        className="rounded-lg object-fill"
                        style={{ maxHeight: "100%", maxWidth: "100%" }}
                      />
                    ) : (
                      <>
                        <svg
                          className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          JPEG / JPG (Max. 1024 x 1024 px)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="dropzone-file"
                    onChange={handleFileChange}
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex w-full flex-col gap-4 px-4 text-white">
                <p>Choose Style:</p>
                <div className="h-auto w-full items-start px-6">
                  <div className="grid grid-cols-1 gap-4">
                    <Slider {...settings}>
                      {itemStyle.map((style) => (
                        <label
                          key={style.id}
                          className="flex flex-col items-center justify-center py-2 hover:scale-105 hover:transform"
                        >
                          <input
                            type="radio"
                            name="style"
                            className="peer hidden"
                            value={style.id}
                            checked={state.selectedStyle === style.id}
                            onChange={() =>
                              setState((prev) => ({
                                ...prev,
                                selectedStyle: style,
                              }))
                            }
                          />
                          <div className="h-24 w-24 cursor-pointer rounded-lg border-[3px] bg-cover bg-center peer-checked:border-blue-500">
                            <img
                              src={style.image}
                              alt={style.label}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          </div>
                          <p className="mt-2">{style.label}</p>
                        </label>
                      ))}
                    </Slider>
                  </div>
                </div>
              </div>
              {/* <Button
                onClick={handleGenerate}
                iconButton={<IoArrowForwardCircleOutline size={25} />}
                variant="primaryFull"
              >
                Generate
              </Button> */}
              <Button variant="primary" size="md" onClick={handleGenerate} isMotion>
                <span>Generate</span>
                <IoArrowForwardCircleOutline size={25} />
              </Button>
            </div>
          </div>
          <div className="bg-primaryColor h-full w-full md:w-2/3">
            <div className="flex flex-col items-center gap-4 p-8">
              <div className="text-white">
                <p>Image</p>
              </div>
              <div className="bg-fontPrimaryColor flex h-[20rem] w-[20rem] flex-col items-center justify-center rounded-lg p-2 md:h-[30rem] md:w-[50rem]">
                <div className="text-primaryColor relative flex h-full w-full items-center justify-center rounded-lg border p-1">
                  {state.imageUrl ? (
                    <img
                      src={state.imageUrl}
                      alt="Generated Result"
                      className="max-h-full object-cover"
                    />
                  ) : (
                    state.output || "Results will appear here..."
                  )}
                  <button
                    onClick={handleDownloadImage}
                    className="hover:bg-accentColor3 hover:text-fontPrimaryColor absolute right-0 top-0 max-w-2xl rounded-full border-2 border-transparent p-2"
                  >
                    <IoMdDownload size={30} />
                  </button>
                </div>
              </div>
              <div className="flex flex-row gap-4">
                <button
                  onClick={handleDeleteAllImages}
                  className="text-fontPrimaryColor hover:border-accentColor2 hover:bg-accentColor2 hover:text-primaryColor max-w-2xl rounded-full border-2 bg-transparent px-4 py-2"
                >
                  Delete
                </button>
                <button
                  onClick={addCredit}
                  className="text-fontPrimaryColor hover:border-accentColor2 hover:bg-accentColor2 hover:text-primaryColor max-w-2xl rounded-full border-2 bg-transparent px-4 py-2"
                >
                  Add Token
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GeneratePage;