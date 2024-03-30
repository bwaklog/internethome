fresh:
	@echo "Cleaning up the project..."
	@rm -rf anna
	@echo "Cloning latest from acmpesuecc/anna..."
	@git clone --quiet --depth=1 https://github.com/acmpesuecc/anna.git
	@echo "Removing template files..."
	@rm -rf anna/site/content/ anna/site/static/ anna/site/layout/{config.yml, tag-subpage.html, tags.html, page.html, posts.html, partials/}
	@echo "Copying personal styles, content and layout into anna..."
	@cp -r site/* anna/site/
	@echo "Building anna and producing rendered site files"
	@cd anna; go build; ./anna
	@
update:
	@echo "Checking if branch is up-to-date with origin..."
	@cd anna; git pull origin
	@echo "Removing template files..."
	@rm -rf anna/site/content/ anna/site/static/ anna/site/layout/{config.yml, tag-subpage.html, tags.html, page.html, posts.html, partials/}
	@echo "Copying personal styles, content and layout into anna..."
	@cp -r site/{content,static,layout} anna/site/
serve:
	@echo "Building and serving site at default port 8000"
	@cd anna; go build; ./anna -s
clean:
	@echo "Cleaning up the project..."
	@rm -rf anna
