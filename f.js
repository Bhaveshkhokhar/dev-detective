
      const showSummaryBtn = document.querySelector(".show-summary-btn");
      if (showSummaryBtn) {
        showSummaryBtn.addEventListener("click", async () => {
          const apiKey =
            "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";

          // determine github username
          let github = entryField.value;
          if (!github) {
            const uname = username.textContent || "";
            github = uname.replace("@", "").trim();
          }
          if (!github) {
            alert("Please search or enter a GitHub username first.");
            return;
          }

          // Check if summary is already showing
          const existingSummary = document.querySelector("#aiSummary");
          const isShowingSummary =
            existingSummary && existingSummary.style.display !== "none";

          if (isShowingSummary) {
            // If summary is showing, just hide all panels.
            // hideAllPanels() will now also reset the button text.
            hideAllPanels();
            return;
          }

          // --- Summary is not showing, so we will show it ---

          // Hide all other panels (and reset all buttons to default)
          hideAllPanels();

          // Set this button's text to "Hide Summary"
          showSummaryBtn.textContent = "Hide Summary";

          // create or find summary element displayed under profile card
          let summaryEl = document.querySelector("#aiSummary");
          if (!summaryEl) {
            summaryEl = document.createElement("div");
            summaryEl.id = "aiSummary";
            summaryEl.className = "ai-summary ";
            // insert after profile container
            if (profileContainer && profileContainer.parentNode) {
              profileContainer.parentNode.insertBefore(
                summaryEl,
                profileContainer.nextSibling
              );
            } else {
              document.body.appendChild(summaryEl);
            }
          }

          // Explicitly show the panel
          summaryEl.style.display = "block";

          showSummaryBtn.disabled = true;
          summaryEl.textContent =
            "Summarizing profile — this may take a few seconds...";

          try {
            // use cached profile if available to avoid refetch
            let userData;
            if (cachedUsername === github && cachedProfile) {
              userData = cachedProfile;
            } else {
              const userResp = await fetch(
                `https://api.github.com/users/${github}`
              );
              userData = await userResp.json();
              // cache profile
              cachedUsername = github;
              cachedProfile = userData;
            }

            // fetch repos (repoDetails will return cached if available)
            const reposArr = await repoDetails(github);

            // prepare concise repo list (top 6 by stars)
            const reposSorted = Array.isArray(reposArr) ? reposArr.slice() : [];
            reposSorted.sort(
              (a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)
            );
            const top = reposSorted.slice(0, 6).map((r) => ({
              name: r.name,
              desc: r.description || "",
              lang: r.language || "N/A",
              stars: r.stargazers_count || 0,
              forks: r.forks_count || 0,
              url: r.html_url,
            }));

            // build prompt for the model
            const promptLines = [];
            promptLines.push(
              `Summarize this GitHub profile for a recruiter. Provide a short summary (3-5 lines), top strengths, and 3 suggested improvements. Also list 3 notable repositories with one-line reason why they're notable.`
            );
            promptLines.push("\nProfile:");
            promptLines.push(`Name: ${userData.name || "N/A"}`);
            promptLines.push(`Login: ${userData.login || github}`);
            if (userData.bio) promptLines.push(`Bio: ${userData.bio}`);
            if (userData.location)
              promptLines.push(`Location: ${userData.location}`);
            promptLines.push(`Followers: ${userData.followers || 0}`);
            promptLines.push(`Following: ${userData.following || 0}`);
            promptLines.push(
              `Public repos: ${
                userData.public_repos ||
                (Array.isArray(reposArr) ? reposArr.length : "N/A")
              }`
            );

            promptLines.push("\nTop repositories:");
            top.forEach((r, i) => {
              const desc = r.desc ? `${r.desc}` : "";
          _EOT_         promptLines.push(
                `${i + 1}. ${r.name} — ${desc} [${r.lang}] ⭐${r.stars} • 🍴${
                  r.forks
                } • ${r.url}`
              );
            });

            const finalPrompt = promptLines.join("\n");

            // call OpenRouter chat completions with CORRECT headers and model
            const resp = await fetch(
              "https://openrouter.ai/api/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
      _EOT_         "HTTP-Referer": window.location.href, // Required by OpenRouter
                  "X-Title": "DevDetective", // Optional but recommended
                },
                body: JSON.stringify({
                  model: "meta-llama/llama-3.2-3b-instruct:free", // Changed to a valid free model
                  messages: [{ role: "user", content: finalPrompt }],
                }),
              }
            );

            if (!resp.ok) {
Read            const errorText = await resp.text();
              console.error("API Error:", resp.status, errorText);
              throw new Error(`API returned ${resp.status}: ${errorText}`);
            }

            const json = await resp.json();

            // extract content in common shapes
            let aiText = "";
            if (
              json?.choices &&
*             Array.isArray(json.choices) &&
              json.choices[0]
            ) {
              if (json.choices[0].message && json.choices[0].message.content)
                aiText = json.choices[0].message.content;
              else if (
                json.choices[0].message &&
                json.choices[0].message.content?.text
              )
                aiText = json.choices[0].message.content.text;
s            else if (json.choices[0].text) aiText = json.choices[0].text;
            }
            // fallback: some APIs use 'output' or 'result'
            if (!aiText && json?.output) aiText = JSON.stringify(json.output);
            if (!aiText && json?.result) aiText = JSON.stringify(json.result);

            if (!aiText)
              aiText = "No summary produced — see raw response in console.";
warning          await renderAIOutput(summaryEl, aiText);
            console.log("OpenRouter response:", json);
    _EOT_     } catch (err) {
            console.error("Error during AI summarization:", err);
            await renderAIOutput(
              summaryEl,
            DANGER   `Error: Could not summarize profile. ${err.message}`
            );
            // If it failed, reset the button text
            showSummaryBtn.textContent = "Summary";
          } finally {
            showSummaryBtn.disabled = false;
          }
        });
      }
